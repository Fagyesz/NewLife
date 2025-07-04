import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EventService } from './event';
import { ConsentService } from './consent';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private eventService = inject(EventService);
  private consentService = inject(ConsentService);
  private platformId = inject(PLATFORM_ID);
  
  // Signals for reactive state
  isLoading = signal(false);
  private localAttendance = signal<Map<string, boolean>>(new Map());

  /** Holds a non-persistent device ID for sessions where consent is denied */
  private sessionDeviceId: string | null = null;

  constructor() {
    // Only load localStorage in browser environment and after consent
    if (isPlatformBrowser(this.platformId) && this.consentService.hasAnalyticsConsent()) {
      this.loadLocalAttendance();
      // Attempt to sync any locally-saved attendance that hasn't yet
      // reached Firebase if we are already online.
      if (navigator.onLine) {
        // Fire and forget
        this.syncOfflineAttendance();
      }
      // When the browser regains network connectivity, push any
      // queued attendance records to Firestore.
      window.addEventListener('online', () => {
        this.syncOfflineAttendance();
      });
    }
  }

  private loadLocalAttendance(): void {
    if (!isPlatformBrowser(this.platformId) || !this.consentService.hasAnalyticsConsent()) {
      return; // Skip localStorage operations on server
    }

    const stored = localStorage.getItem('church-attendance');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const map = new Map<string, boolean>();
        Object.entries(data).forEach(([key, value]) => {
          map.set(key, Boolean(value));
        });
        this.localAttendance.set(map);
      } catch (error) {
        console.warn('Error loading local attendance:', error);
      }
    }
  }

  private saveLocalAttendance(): void {
    if (!isPlatformBrowser(this.platformId) || !this.consentService.hasAnalyticsConsent()) {
      return; // Skip localStorage operations on server
    }

    const data = Object.fromEntries(this.localAttendance());
    localStorage.setItem('church-attendance', JSON.stringify(data));
  }

  private getDeviceId(): string {
    // If consent denied or we are on server, use an in-memory device id that is
    // stable for the current session but not persisted.
    if (!isPlatformBrowser(this.platformId) || !this.consentService.hasAnalyticsConsent()) {
      if (!this.sessionDeviceId) {
        this.sessionDeviceId = 'session-' + Math.random().toString(36).substring(2, 15);
      }
      return this.sessionDeviceId;
    }

    let deviceId = localStorage.getItem('church-device-id');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substring(2, 15);
      if (this.consentService.hasAnalyticsConsent()) {
        localStorage.setItem('church-device-id', deviceId);
      }
    }
    return deviceId;
  }

  /**
   * Push locally cached attendance markers to Firebase once we have
   * connectivity again. Runs silently; failures are logged but do not
   * interrupt the user. Safe to call multiple times.
   */
  private async syncOfflineAttendance(): Promise<void> {
    // Guard against non-browser or Firestore still unavailable
    if (!isPlatformBrowser(this.platformId) || !navigator.onLine) {
      return;
    }

    // Only attempt if we think Firebase is reachable
    if (!this.eventService.isFirebaseConnected()) {
      return;
    }

    const localMap = this.localAttendance();
    for (const [eventId, attended] of localMap) {
      if (!attended) continue;
      try {
        // If the event already contains our device ID this will resolve quickly
        await this.eventService.markAttendance(eventId, this.getDeviceId());
      } catch (err) {
        console.warn('⚠️  Failed to sync offline attendance for event', eventId);
        // Keep it in the queue; we will retry on next online event
      }
    }
  }

  async markAttendance(eventId: string, userId?: string): Promise<void> {
    if (!this.consentService.hasAnalyticsConsent()) {
      throw new Error('A részvétel jelzéséhez kérjük fogadja el a sütiket / analytics használatát.');
    }

    const deviceId = this.getDeviceId();
    
    try {
      this.isLoading.set(true);
      
      // Mark attendance in Firebase via EventService
      await this.eventService.markAttendance(eventId, deviceId);
      
      // Also store locally as backup
      const localMap = new Map(this.localAttendance());
      localMap.set(eventId, true);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
      
    } catch (error) {
      console.error('Error marking attendance, saving locally:', error);
      // Fall back to local storage
      const localMap = new Map(this.localAttendance());
      localMap.set(eventId, true);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
      // Only notify callers if we are actually online – when offline we
      // treat the action as queued rather than failed.
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        throw error; // Re-throw so UI can show error
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeAttendance(eventId: string): Promise<void> {
    if (!this.consentService.hasAnalyticsConsent()) {
      throw new Error('A részvétel visszavonásához kérjük fogadja el a sütiket / analytics használatát.');
    }

    const deviceId = this.getDeviceId();
    
    try {
      this.isLoading.set(true);
      
      // Remove attendance in Firebase via EventService
      await this.eventService.removeAttendance(eventId, deviceId);
      
      // Also remove from local storage
      const localMap = new Map(this.localAttendance());
      localMap.delete(eventId);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
      
    } catch (error) {
      console.error('Error removing attendance:', error);
      // Still remove from local storage
      const localMap = new Map(this.localAttendance());
      localMap.delete(eventId);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
      // Only re-throw when online so UI can show error
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        throw error;
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async hasMarkedAttendance(eventId: string): Promise<boolean> {
    if (!this.consentService.hasAnalyticsConsent()) {
      return false;
    }

    const deviceId = this.getDeviceId();
    
    // Check local storage first (faster and works offline)
    if (this.localAttendance().has(eventId)) {
      return this.localAttendance().get(eventId) || false;
    }

    // Check Firebase via EventService
    try {
      const hasAttended = this.eventService.hasMarkedAttendance(eventId, deviceId);
      
      // Update local storage with the result
      const localMap = new Map(this.localAttendance());
      localMap.set(eventId, hasAttended);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
      
      return hasAttended;
    } catch (error) {
      console.warn('Error checking attendance, using local storage:', error);
      return this.localAttendance().get(eventId) || false;
    }
  }

  getAttendanceCount(eventId: string): number {
    return this.eventService.getAttendanceCount(eventId);
  }

  isFirebaseConnected(): boolean {
    return this.eventService.isFirebaseConnected();
  }

  getAttendanceStats() {
    const events = this.eventService.events();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    // Calculate stats from events with attendance data
    const thisWeekEvents = events.filter(event => 
      event.date >= weekAgo && event.date <= now && (event.attendanceCount || 0) > 0
    );
    
    const thisMonthEvents = events.filter(event => 
      event.date >= monthAgo && event.date <= now && (event.attendanceCount || 0) > 0
    );
    
    const totalAttendance = events.reduce((sum, event) => sum + (event.attendanceCount || 0), 0);
    const thisWeekAttendance = thisWeekEvents.reduce((sum, event) => sum + (event.attendanceCount || 0), 0);
    const thisMonthAttendance = thisMonthEvents.reduce((sum, event) => sum + (event.attendanceCount || 0), 0);
    
    // Estimate unique devices (this is approximate since we don't have the detailed records)
    const eventsWithAttendance = events.filter(event => (event.attendanceCount || 0) > 0);
    const estimatedUniqueDevices = eventsWithAttendance.length > 0 ? 
      Math.ceil(totalAttendance / eventsWithAttendance.length) : 0;
    
    return {
      total: totalAttendance,
      thisWeek: thisWeekAttendance,
      thisMonth: thisMonthAttendance,
      uniqueDevices: estimatedUniqueDevices
    };
  }
}
