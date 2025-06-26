import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EventService } from './event';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private eventService = inject(EventService);
  private platformId = inject(PLATFORM_ID);
  
  // Signals for reactive state
  isLoading = signal(false);
  private localAttendance = signal<Map<string, boolean>>(new Map());

  constructor() {
    // Only load localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadLocalAttendance();
    }
  }

  private loadLocalAttendance(): void {
    if (!isPlatformBrowser(this.platformId)) {
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
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage operations on server
    }

    const data = Object.fromEntries(this.localAttendance());
    localStorage.setItem('church-attendance', JSON.stringify(data));
  }

  private getDeviceId(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'server-fallback-' + Math.random().toString(36).substring(2, 15);
    }

    let deviceId = localStorage.getItem('church-device-id');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('church-device-id', deviceId);
    }
    return deviceId;
  }

  async markAttendance(eventId: string, userId?: string): Promise<void> {
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
      throw error; // Re-throw to show error to user
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeAttendance(eventId: string): Promise<void> {
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
      throw error; // Re-throw to show error to user
    } finally {
      this.isLoading.set(false);
    }
  }

  async hasMarkedAttendance(eventId: string): Promise<boolean> {
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
