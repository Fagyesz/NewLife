import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';

export interface AttendanceRecord {
  id?: string;
  eventId: string;
  deviceId: string;
  timestamp: Date;
  confirmed: boolean;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private firestore = inject(Firestore);
  
  // Signals for reactive state
  attendanceRecords = signal<AttendanceRecord[]>([]);
  isLoading = signal(false);

  constructor() {
    this.loadAttendanceRecords();
  }

  private loadAttendanceRecords(): void {
    const attendanceRef = collection(this.firestore, 'attendance');
    
    onSnapshot(attendanceRef, (snapshot) => {
      const records: AttendanceRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          timestamp: data['timestamp'].toDate() // Convert Firestore timestamp to Date
        } as AttendanceRecord);
      });
      this.attendanceRecords.set(records);
    });
  }

  /**
   * Generate device fingerprint for attendance tracking
   * Based on the development plan implementation
   */
  getDeviceId(): string {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled ? 'cookies-enabled' : 'cookies-disabled'
    ].join('|');
    
    // Create a simple hash of the fingerprint
    return btoa(fingerprint).substring(0, 32);
  }

  /**
   * Mark attendance for an event
   */
  async markAttendance(eventId: string): Promise<void> {
    try {
      this.isLoading.set(true);
      const deviceId = this.getDeviceId();
      
      // Check if device already marked attendance for this event
      const existingRecord = await this.getAttendanceForEvent(eventId, deviceId);
      if (existingRecord) {
        throw new Error('Ez az eszköz már jelezte a részvételt erre az eseményre');
      }

      const attendanceData: Omit<AttendanceRecord, 'id'> = {
        eventId,
        deviceId,
        timestamp: new Date(),
        confirmed: true,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      };

      const attendanceRef = collection(this.firestore, 'attendance');
      await addDoc(attendanceRef, attendanceData);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Remove attendance for an event (if user changes mind)
   */
  async removeAttendance(eventId: string): Promise<void> {
    try {
      this.isLoading.set(true);
      const deviceId = this.getDeviceId();
      
      const existingRecord = await this.getAttendanceForEvent(eventId, deviceId);
      if (existingRecord) {
        const recordRef = doc(this.firestore, 'attendance', existingRecord.id!);
        await updateDoc(recordRef, { confirmed: false });
      }
      
    } catch (error) {
      console.error('Error removing attendance:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Check if current device has marked attendance for an event
   */
  async hasMarkedAttendance(eventId: string): Promise<boolean> {
    const deviceId = this.getDeviceId();
    const record = await this.getAttendanceForEvent(eventId, deviceId);
    return record?.confirmed === true;
  }

  /**
   * Get attendance count for an event
   */
  getAttendanceCount(eventId: string): number {
    return this.attendanceRecords()
      .filter(record => record.eventId === eventId && record.confirmed)
      .length;
  }

  /**
   * Get all attendance records for an event (for staff/admin)
   */
  getEventAttendance(eventId: string): AttendanceRecord[] {
    return this.attendanceRecords()
      .filter(record => record.eventId === eventId && record.confirmed);
  }

  /**
   * Get attendance statistics for dashboard
   */
  getAttendanceStats() {
    const records = this.attendanceRecords();
    const confirmed = records.filter(r => r.confirmed);
    
    return {
      total: confirmed.length,
      thisWeek: confirmed.filter(r => this.isThisWeek(r.timestamp)).length,
      thisMonth: confirmed.filter(r => this.isThisMonth(r.timestamp)).length,
      uniqueDevices: new Set(confirmed.map(r => r.deviceId)).size
    };
  }

  private async getAttendanceForEvent(eventId: string, deviceId: string): Promise<AttendanceRecord | null> {
    const attendanceRef = collection(this.firestore, 'attendance');
    const q = query(
      attendanceRef, 
      where('eventId', '==', eventId),
      where('deviceId', '==', deviceId)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data['timestamp'].toDate()
      } as AttendanceRecord;
    }
    
    return null;
  }

  private async getClientIP(): Promise<string> {
    try {
      // In a real app, you might use a service to get the client IP
      // For now, we'll return a placeholder
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
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
