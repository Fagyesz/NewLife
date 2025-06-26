import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from './auth';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date;
  type: 'service' | 'meeting' | 'special' | 'bible_study' | 'prayer_meeting' | 'youth' | 'children' | 'baptism' | 'wedding' | 'funeral' | 'concert' | 'conference' | 'outreach' | 'fellowship' | 'training';
  location: string;
  imageUrl?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Attendance data
  attendees?: string[]; // Array of device IDs or user IDs
  attendanceCount?: number; // Computed field for quick access
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Signals for reactive state
  events = signal<Event[]>([]);
  isLoading = signal(false);
  private firebaseConnected = signal(true); // Start with true, only set false if real issues

  constructor() {
    this.loadEvents();
  }

  private loadEvents(): void {
    console.log('🔄 Starting to load events from Firestore...');
    try {
      const eventsRef = collection(this.firestore, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));
      
      console.log('📡 Setting up Firestore events listener...');
      onSnapshot(q, (snapshot) => {
        console.log('📦 Received Firestore snapshot with', snapshot.size, 'documents');
        const events: Event[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          events.push({
            id: doc.id,
            ...data,
            date: data['date'].toDate(), // Convert Firestore timestamp to Date
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate()
          } as Event);
        });
        this.events.set(events);
        this.firebaseConnected.set(true);
        console.log('✅ Successfully loaded', events.length, 'events from Firestore');
      }, (error) => {
        console.error('❌ Firebase events listener error:', error);
        console.log('🔄 Loading fallback events...');
        this.loadFallbackEvents();
        this.firebaseConnected.set(false);
      });
    } catch (error) {
      console.error('❌ Failed to initialize events listener:', error);
      console.log('🔄 Loading fallback events...');
      this.loadFallbackEvents();
      this.firebaseConnected.set(false);
    }
  }

  private loadFallbackEvents(): void {
    // Fallback events when Firebase listener is not available (but can still create)
    const fallbackEvents: Event[] = [
      {
        id: 'fallback-1',
        title: 'Karácsonyi istentisztelet',
        description: 'Különleges karácsonyi ünnepség a gyülekezetben',
        date: new Date('2024-12-25T10:00:00'),
        type: 'special',
        location: 'Gyöngyös Gyüli',
        createdBy: 'system'
      },
      {
        id: 'fallback-2',
        title: 'Újévi imaóra',
        description: 'Köszönet és kérés az új évért',
        date: new Date('2025-01-01T18:00:00'),
        type: 'meeting',
        location: 'Gyöngyös Gyüli',
        createdBy: 'system'
      },
      {
        id: 'fallback-3',
        title: 'Ifjúsági találkozó',
        description: 'Fiatalok közös programja',
        date: new Date('2025-01-15T19:00:00'),
        type: 'meeting',
        location: 'Gyöngyös Gyüli',
        createdBy: 'system'
      }
    ];
    
    this.events.set(fallbackEvents);
  }

  async createEvent(event: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.authService.isStaff()) {
      throw new Error('Nincs jogosultsága események létrehozásához');
    }

    try {
      this.isLoading.set(true);
      const userProfile = this.authService.userProfile();
      
      // Set default location if empty
      const location = event.location?.trim() || 'Gyöngyös Gyüli';
      
      const eventData = {
        ...event,
        location,
        createdBy: userProfile?.uid || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('📅 Creating event:', eventData);
      const eventsRef = collection(this.firestore, 'events');
      const docRef = await addDoc(eventsRef, eventData);
      console.log('✅ Event created successfully with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating event:', error);
      throw new Error('Hiba történt az esemény létrehozása során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    if (!this.authService.isStaff()) {
      throw new Error('Nincs jogosultsága események módosításához');
    }

    try {
      this.isLoading.set(true);
      
      // Set default location if empty or updating location
      if (updates.location !== undefined) {
        updates.location = updates.location?.trim() || 'Gyöngyös Gyüli';
      }
      
      const eventRef = doc(this.firestore, 'events', eventId);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      console.log('✅ Event updated successfully:', eventId);
    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw new Error('Hiba történt az esemény frissítése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.authService.isAdmin()) {
      throw new Error('Nincs jogosultsága események törléséhez');
    }

    try {
      this.isLoading.set(true);
      const eventRef = doc(this.firestore, 'events', eventId);
      await deleteDoc(eventRef);
      console.log('✅ Event deleted successfully:', eventId);
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw new Error('Hiba történt az esemény törlése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  getUpcomingEvents(): Event[] {
    const now = new Date();
    return this.events().filter(event => event.date >= now);
  }

  getEventsByType(type: Event['type']): Event[] {
    return this.events().filter(event => event.type === type);
  }

  getEventById(id: string): Event | undefined {
    return this.events().find(event => event.id === id);
  }

  // Get next Sunday service
  getNextSundayService(): Event | undefined {
    const now = new Date();
    return this.events().find(event => 
      event.type === 'service' && 
      event.date >= now &&
      event.date.getDay() === 0 // Sunday
    );
  }

  isFirebaseConnected(): boolean {
    return this.firebaseConnected();
  }

  // Attendance methods - storing attendance directly in events
  async markAttendance(eventId: string, deviceId: string): Promise<void> {
    try {
      const eventRef = doc(this.firestore, 'events', eventId);
      const event = this.getEventById(eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }

      // Get current attendees array or create empty one
      const currentAttendees = event.attendees || [];
      
      // Add deviceId if not already present
      if (!currentAttendees.includes(deviceId)) {
        const updatedAttendees = [...currentAttendees, deviceId];
        
        await updateDoc(eventRef, {
          attendees: updatedAttendees,
          attendanceCount: updatedAttendees.length,
          updatedAt: new Date()
        });
        
        console.log('✅ Attendance marked for event:', eventId);
      }
    } catch (error) {
      console.error('❌ Error marking attendance:', error);
      throw new Error('Hiba történt a részvétel jelzése során: ' + (error as Error).message);
    }
  }

  async removeAttendance(eventId: string, deviceId: string): Promise<void> {
    try {
      const eventRef = doc(this.firestore, 'events', eventId);
      const event = this.getEventById(eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }

      // Get current attendees array
      const currentAttendees = event.attendees || [];
      
      // Remove deviceId if present
      const updatedAttendees = currentAttendees.filter(id => id !== deviceId);
      
      await updateDoc(eventRef, {
        attendees: updatedAttendees,
        attendanceCount: updatedAttendees.length,
        updatedAt: new Date()
      });
      
      console.log('✅ Attendance removed for event:', eventId);
    } catch (error) {
      console.error('❌ Error removing attendance:', error);
      throw new Error('Hiba történt a részvétel törlése során: ' + (error as Error).message);
    }
  }

  hasMarkedAttendance(eventId: string, deviceId: string): boolean {
    const event = this.getEventById(eventId);
    return event?.attendees?.includes(deviceId) || false;
  }

  getAttendanceCount(eventId: string): number {
    const event = this.getEventById(eventId);
    return event?.attendanceCount || event?.attendees?.length || 0;
  }
}
