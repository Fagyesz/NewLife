import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, deleteDoc, doc, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';

export interface AttendanceRecord {
  id?: string;
  eventId: string;
  userId?: string;
  deviceId: string;
  timestamp: Date;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  
  // Signals for reactive state
  attendanceRecords = signal<AttendanceRecord[]>([]);
  isLoading = signal(false);
  private firebaseConnected = signal(false);
  private localAttendance = signal<Map<string, boolean>>(new Map());

  constructor() {
    this.loadAttendanceRecords();
    // Only load localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadLocalAttendance();
    }
  }

  private loadAttendanceRecords(): void {
    try {
      const attendanceRef = collection(this.firestore, 'attendance');
      
      onSnapshot(attendanceRef, (snapshot) => {
        const records: AttendanceRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          records.push({
            id: doc.id,
            ...data,
            timestamp: data['timestamp'].toDate()
          } as AttendanceRecord);
        });
        this.attendanceRecords.set(records);
        this.firebaseConnected.set(true);
      }, (error) => {
        console.warn('Firebase attendance connection error, using local storage:', error);
        this.firebaseConnected.set(false);
      });
    } catch (error) {
      console.warn('Failed to initialize Firebase attendance listener:', error);
      this.firebaseConnected.set(false);
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
    
    if (this.firebaseConnected()) {
      try {
        this.isLoading.set(true);
        
        const attendanceData = {
          eventId,
          userId: userId || '',
          deviceId,
          timestamp: new Date(),
          ipAddress: '' // Could be populated if needed
        };

        const attendanceRef = collection(this.firestore, 'attendance');
        await addDoc(attendanceRef, attendanceData);
        
        // Also store locally as backup
        const localMap = new Map(this.localAttendance());
        localMap.set(eventId, true);
        this.localAttendance.set(localMap);
        this.saveLocalAttendance();
        
      } catch (error) {
        console.error('Error marking attendance in Firebase, saving locally:', error);
        // Fall back to local storage
        const localMap = new Map(this.localAttendance());
        localMap.set(eventId, true);
        this.localAttendance.set(localMap);
        this.saveLocalAttendance();
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Firebase not connected, use local storage
      const localMap = new Map(this.localAttendance());
      localMap.set(eventId, true);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
    }
  }

  async removeAttendance(eventId: string): Promise<void> {
    const deviceId = this.getDeviceId();
    
    if (this.firebaseConnected()) {
      try {
        this.isLoading.set(true);
        
        // Find and delete the attendance record
        const attendanceRef = collection(this.firestore, 'attendance');
        const q = query(attendanceRef, where('eventId', '==', eventId), where('deviceId', '==', deviceId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(this.firestore, 'attendance', docSnapshot.id));
        });
        
        // Also remove from local storage
        const localMap = new Map(this.localAttendance());
        localMap.delete(eventId);
        this.localAttendance.set(localMap);
        this.saveLocalAttendance();
        
      } catch (error) {
        console.error('Error removing attendance from Firebase:', error);
        // Still remove from local storage
        const localMap = new Map(this.localAttendance());
        localMap.delete(eventId);
        this.localAttendance.set(localMap);
        this.saveLocalAttendance();
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Firebase not connected, use local storage
      const localMap = new Map(this.localAttendance());
      localMap.delete(eventId);
      this.localAttendance.set(localMap);
      this.saveLocalAttendance();
    }
  }

  async hasMarkedAttendance(eventId: string): Promise<boolean> {
    // Check local storage first (faster and works offline)
    if (this.localAttendance().has(eventId)) {
      return this.localAttendance().get(eventId) || false;
    }

    // If Firebase is connected, check there too
    if (this.firebaseConnected()) {
      try {
        const deviceId = this.getDeviceId();
        const attendanceRef = collection(this.firestore, 'attendance');
        const q = query(attendanceRef, where('eventId', '==', eventId), where('deviceId', '==', deviceId));
        const querySnapshot = await getDocs(q);
        
        const hasAttended = !querySnapshot.empty;
        
        // Update local storage with Firebase result
        const localMap = new Map(this.localAttendance());
        localMap.set(eventId, hasAttended);
        this.localAttendance.set(localMap);
        this.saveLocalAttendance();
        
        return hasAttended;
      } catch (error) {
        console.warn('Error checking Firebase attendance, using local data:', error);
      }
    }

    return false;
  }

  getAttendanceCount(eventId: string): number {
    if (this.firebaseConnected()) {
      return this.attendanceRecords().filter(record => record.eventId === eventId).length;
    } else {
      // When Firebase is not connected, show a placeholder count
      return this.localAttendance().has(eventId) ? 1 : 0;
    }
  }

  getAttendanceRecords(): AttendanceRecord[] {
    return this.attendanceRecords();
  }

  isFirebaseConnected(): boolean {
    return this.firebaseConnected();
  }

  getAttendanceStats() {
    const records = this.attendanceRecords();
    
    return {
      total: records.length,
      thisWeek: records.filter(r => this.isThisWeek(r.timestamp)).length,
      thisMonth: records.filter(r => this.isThisMonth(r.timestamp)).length,
      uniqueDevices: new Set(records.map(r => r.deviceId)).size
    };
  }

  private isThisWeek(date: Date): boolean {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }

  private isThisMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
}
