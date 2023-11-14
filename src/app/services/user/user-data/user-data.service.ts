import { Injectable, NgZone, inject, Component } from '@angular/core';
import { User } from 'src/app/models/user/user';
import { Role } from 'src/app/models/user/role';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Lang } from 'src/app/models/user/lang';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private dbPath = '/users';

  usersRef: AngularFirestoreCollection<User>;

  constructor(private db: AngularFirestore, public authService: AuthService) {
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

  // Function to get users role
  getRole(uid: string): Observable<string> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.role) {
            return user.role;
          } else {
            return 'error user.role or user not exist';
          }
        })
      );
  }
  isStaff(uid: string): Observable<boolean> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.role) {
            //if user.role .lowercase organizer admin or owner
            if (user.role.toLowerCase() === 'organizer'||user.role.toLowerCase() === 'admin'||user.role.toLowerCase() === 'owner') {
              return true;

            }

          }
          return false; // return false outside of the if statement
      }),
      // Add the following line to handle the undefined case
      map((value) => value ?? false)
    );
  }

  getTitle(uid: string): Observable<string | undefined> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.title !== null) {
            return user.title;
          } else {
            return 'Error while tryin to get users title';
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
          if (user && user.description !== null) {
            return user.description;
          } else {
            return 'Error while tryin to get user description';
          }
        })
      );
  }
  getActive(uid: string): Observable<boolean | undefined> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.active !== null) {
            return user.active;
          } else {
            return false; //'Error while tryin to get user description';
          }
        })
      );
  }
  getLanguage(uid: string): Observable<string | undefined> {
    return this.db
      .doc<User>(`${this.dbPath}/${uid}`)
      .valueChanges()
      .pipe(
        map((user) => {
          if (user && user.language !== null) {
            return user.language;
          } else {
            return 'Error while tryin to get user Langeuge';
          }
        })
      );
  }

  setLanguage(uid: string, language: Lang): Promise<void> {
    // Update the 'language' field in the user document
    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `${this.dbPath}/${uid}`
    );

    // Use the update method to only update the 'language' field
    return userRef.update({ language });
  }
  setPhotoUrl(uid: string, photoURL: string) {
    // Update the 'photoUrl' field in the user document
    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `${this.dbPath}/${uid}`
    );

    // Use the update method to only update the 'photoUrl' field
    return userRef.update({ photoURL });
  }
  setActive(uid: string, active: boolean) {
    // Update the 'active' field in the user document
    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `${this.dbPath}/${uid}`
    );

    // Use the update method to only update the 'active' field
    return userRef.update({ active });
  }
  setTitle(uid: string, title: string) {
    // Update the 'photoUrl' field in the user document
    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `${this.dbPath}/${uid}`
    );

    // Use the update method to only update the 'photoUrl' field
    return userRef.update({ title });
  }
  setDescription(uid: string, description: string) {
    // Update the 'photoUrl' field in the user document
    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `${this.dbPath}/${uid}`
    );

    // Use the update method to only update the 'photoUrl' field
    return userRef.update({ description });
  }
  setRole(uid: string, role: Role) {
    // Check if the role parameter is an instance of the Role enum
    if (!Object.values(Role).includes(role as Role)) {
      console.error('Invalid role');
      return;
    }

    // Check if the role is owner
    if (role === Role.Owner) {
      console.error('You cannot set owner role');
      return;
    }

    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `${this.dbPath}/${uid}`
    );

    // Use the update method to only update the 'role' field
    return userRef.update({ role });
  }
  setOwner(email: string, role: Role): void {
    if (email) {
      this.authService.getUserByEmail(email).subscribe((user) => {
        if (user && user.uid) {
          if (user.role !== role) {
            if (!Object.values(Role).includes(role as Role)) {
              console.error('Invalid role');
              return;
            }
            const userRef: AngularFirestoreDocument<User> = this.db.doc(
              `${this.dbPath}/${user.uid}`
            );

            // Use the update method to only update the 'role' field
            console.log('User role updated to owner');
            return userRef.update({ role });
          } else console.error('User already has this role');
        }
        else
          console.error('User not found');
        return;
      });
    }
    return;
  }
}
