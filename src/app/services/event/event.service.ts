import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Event } from 'src/app/models/event/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private dbPath = '/events';
  eventsRef: AngularFirestoreCollection<Event>;

  constructor(private db: AngularFirestore) {
    this.eventsRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<Event> {
    
    return this.eventsRef;
  }

  create(event: Event): any {
    if (this.eventsRef) {
      return this.eventsRef.add({ ...event });
    } else {
      console.error('Collection reference is null.');
      return null;
    }
  }

  update(id: string, data: any): Promise<void> {
    if (this.eventsRef) {
      return this.eventsRef.doc(id).update(data);
    } else {
      console.error('Collection reference is null.');
      return Promise.reject('Collection reference is null.');
    }
  }

  delete(id: string): Promise<void> {
    if (this.eventsRef) {
      return this.eventsRef.doc(id).delete();
    } else {
      console.error('Collection reference is null.');
      return Promise.reject('Collection reference is null.');
    }
  }
}
