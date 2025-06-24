import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff' | 'member';
  isAuthorized: boolean;
  lastLogin: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signals for reactive state
  currentUser = signal<User | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal(false);

  // Authorized staff emails (in real app, this would be in Firestore)
  private authorizedEmails = [
    'admin@ujeletbaptista.hu',
    'lelkesz@ujeletbaptista.hu',
    'staff@ujeletbaptista.hu'
  ];

  constructor() {
    // Listen to auth state changes
    user(this.auth).subscribe(async (user) => {
      this.currentUser.set(user);
      if (user) {
        await this.loadUserProfile(user);
      } else {
        this.userProfile.set(null);
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.isLoading.set(true);
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      
      if (credential.user) {
        const isAuthorized = this.authorizedEmails.includes(credential.user.email || '');
        
        const userProfile: UserProfile = {
          uid: credential.user.uid,
          email: credential.user.email || '',
          displayName: credential.user.displayName || '',
          role: this.determineRole(credential.user.email || ''),
          isAuthorized,
          lastLogin: new Date()
        };

        // Save user profile to Firestore
        await this.saveUserProfile(userProfile);
        
        if (!isAuthorized) {
          console.warn('Unauthorized user attempted to login');
          await this.signOut();
          throw new Error('Nincs jogosultsága a bejelentkezéshez');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  private async loadUserProfile(user: User): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        this.userProfile.set(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', profile.uid);
      await setDoc(userDocRef, profile, { merge: true });
      this.userProfile.set(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  private determineRole(email: string): 'admin' | 'staff' | 'member' {
    if (email.includes('admin')) return 'admin';
    if (email.includes('lelkesz') || email.includes('staff')) return 'staff';
    return 'member';
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.userProfile()?.role === 'admin';
  }

  isStaff(): boolean {
    const role = this.userProfile()?.role;
    return role === 'admin' || role === 'staff';
  }

  isAuthorized(): boolean {
    return this.userProfile()?.isAuthorized === true;
  }
}
