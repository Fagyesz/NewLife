import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, where, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date;
  type: 'service' | 'meeting' | 'special';
  location: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
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

  constructor() {
    this.loadEvents();
  }

  private loadEvents(): void {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));
    
    onSnapshot(q, (snapshot) => {
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
    });
  }

  async createEvent(event: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.authService.isStaff()) {
      throw new Error('Nincs jogosultsága események létrehozásához');
    }

    try {
      this.isLoading.set(true);
      const userProfile = this.authService.userProfile();
      
      const eventData = {
        ...event,
        createdBy: userProfile?.uid || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const eventsRef = collection(this.firestore, 'events');
      const docRef = await addDoc(eventsRef, eventData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
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
      const eventRef = doc(this.firestore, 'events', eventId);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
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
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
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
}
