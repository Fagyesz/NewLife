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
  // Function to check if a user is an admin
  isAdmin(uid: string): Observable<boolean> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.roles && user.roles.admin === true) {
            return true;
          } else {
            return false;
          }
        })
      );
  }
  // Function to check if a user is an organizer
  isOrganizer(uid: string): Observable<boolean> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.roles && user.roles.organizer === true) {
            return true;
          } else {
            return false;
          }
        })
      );
  }
  // Function to check if a user is have the title u check
  isTitle(uid: string, title: string): Observable<boolean> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.title === title) {
            return true;
          } else {
            return false;
          }
        })
      );
  }
  getTitle(uid: string): Observable<string | undefined> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.title !== '') {
            return user.title;
          } else {
            return '';
          }
        })
      );
  }
  getDescription(uid: string): Observable<string | undefined> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.description !== '') {
            return user.description;
          } else {
            return '';
          }
        })
      );
  }
}
