import { Injectable, NgZone, inject, Component } from '@angular/core';
import { User } from 'src/app/models/user/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private dbPath = '/users';

  usersRef: AngularFirestoreCollection<User>;

  constructor(private db: AngularFirestore) {
    this.usersRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<User> {
    return this.usersRef;
  }
  // Function to get all users with emailVerified set to true
  getAllVerified(): AngularFirestoreCollection<User> {
    return this.db.collection<User>(this.dbPath, (ref) =>
      ref.where('emailVerified', '==', true)
    );
  }

  // Function to get all users with admin role
  getAdmins(): AngularFirestoreCollection<User> {
    return this.db.collection<User>(this.dbPath, (ref) =>
      ref.where('roles.admin', '==', true)
    );
  }

  // Function to get all users with organizer role
  getOrganizers(): AngularFirestoreCollection<User> {
    return this.db.collection<User>(this.dbPath, (ref) =>
      ref.where('roles.organizer', '==', true)
    );
  }
}
