import { Injectable, inject, signal } from '@angular/core';
import { Auth, User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'staff' | 'member' | 'dev';
  isAuthorized: boolean;
  lastLogin: Date;
  createdAt: Date;
  loginCount: number;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  
  // Reactive signal for current user
  user$ = user(this.auth);
  currentUserSig = signal<User | null | undefined>(undefined);
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal(false);

  constructor() {
    console.log('🔥 Firebase Auth Service initializing...');
    console.log('🔥 Firebase project:', this.auth.app.options.projectId);
    
    // Listen to auth state changes
    onAuthStateChanged(this.auth, async (user) => {
      console.log('🔥 Auth state changed:', user ? user.email : 'no user');
      this.currentUserSig.set(user);
      
      if (user) {
        // Load user profile from Firestore
        await this.loadUserProfile(user);
      } else {
        this.userProfile.set(null);
      }
    });
  }

  // Google Sign In
  async signInWithGoogle(): Promise<void> {
    try {
      console.log('🔑 Starting Google Sign In...');
      this.isLoading.set(true);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🔑 Attempting popup sign in...');
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        console.log('✅ Successfully signed in:', result.user.displayName);
        
        // Save/update user profile in Firestore
        await this.saveUserProfile(result.user, 'google');
        
        this.router.navigate(['/fooldal']); // Redirect to home page
      }
    } catch (error: any) {
      console.error('❌ Google Sign In Error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Provide more specific error messages
      let userMessage = 'Hiba történt a bejelentkezés során.';
      
      if (error.code === 'auth/api-key-not-valid') {
        userMessage = 'Firebase API kulcs hibás. Kérjük, vegye fel a kapcsolatot az adminisztrátorral.';
      } else if (error.code === 'auth/popup-blocked') {
        userMessage = 'A böngésző blokkolja a popup ablakot. Kérjük, engedélyezze a popup ablakokat.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        userMessage = 'Bejelentkezés megszakítva.';
      }
      
      throw new Error(userMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('✅ Successfully signed out');
      this.router.navigate(['/fooldal']); // Redirect to home page
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }

  // Load user profile from Firestore
  private async loadUserProfile(user: User): Promise<void> {
    try {
      console.log('📂 Loading user profile from Firestore...');
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const firestoreData = userDoc.data() as UserProfile;
        console.log('📂 User profile loaded from Firestore:', firestoreData);
        
        // Convert Firestore timestamps to Date objects
        const profile: UserProfile = {
          ...firestoreData,
          lastLogin: (firestoreData.lastLogin as any)?.toDate ? (firestoreData.lastLogin as any).toDate() : new Date(firestoreData.lastLogin),
          createdAt: (firestoreData.createdAt as any)?.toDate ? (firestoreData.createdAt as any).toDate() : new Date(firestoreData.createdAt)
        };
        
        this.userProfile.set(profile);
      } else {
        console.log('📂 No existing profile found, will create new one on next login');
        // Create basic profile from Firebase user
        const profile = this.createUserProfile(user, 'google');
        this.userProfile.set(profile);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Fallback to basic profile
      const profile = this.createUserProfile(user, 'google');
      this.userProfile.set(profile);
    }
  }

  // Save user profile to Firestore
  private async saveUserProfile(user: User, provider: string): Promise<void> {
    try {
      console.log('💾 Saving user profile to Firestore...');
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const now = new Date();
      
      if (userDoc.exists()) {
        // Update existing user
        const existingData = userDoc.data() as UserProfile;
        const updatedProfile: Partial<UserProfile> = {
          email: user.email || existingData.email,
          displayName: user.displayName || existingData.displayName,
          photoURL: user.photoURL || existingData.photoURL,
          lastLogin: now,
          loginCount: (existingData.loginCount || 0) + 1,
          // Keep existing role and other data
        };
        
        await updateDoc(userDocRef, updatedProfile);
        console.log('💾 User profile updated in Firestore');
        
        // Update local profile
        const fullProfile: UserProfile = {
          ...existingData,
          ...updatedProfile,
          lastLogin: now
        };
        this.userProfile.set(fullProfile);
        
      } else {
        // Create new user profile
        const newProfile = this.createUserProfile(user, provider);
        newProfile.createdAt = now;
        newProfile.loginCount = 1;
        
        await setDoc(userDocRef, newProfile);
        console.log('💾 New user profile created in Firestore:', newProfile);
        
        this.userProfile.set(newProfile);
      }
    } catch (error) {
      console.error('❌ Error saving user profile to Firestore:', error);
      // Still create local profile even if Firestore fails
      const profile = this.createUserProfile(user, provider);
      this.userProfile.set(profile);
    }
  }

  // Create user profile object
  private createUserProfile(user: User, provider: string): UserProfile {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email || 'Felhasználó',
      photoURL: user.photoURL || '',
      role: this.determineRole(user.email || ''),
      isAuthorized: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      loginCount: 1,
      provider: provider
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUserSig();
  }

  // Get current user
  getCurrentUser(): User | null | undefined {
    return this.currentUserSig();
  }

  // Get user display name
  getUserDisplayName(): string {
    const user = this.currentUserSig();
    return user?.displayName || user?.email || 'Felhasználó';
  }

  // Get user photo URL
  getUserPhotoURL(): string | null {
    const user = this.currentUserSig();
    return user?.photoURL || null;
  }

  // Get user email
  getUserEmail(): string | null {
    const user = this.currentUserSig();
    return user?.email || null;
  }

  // Role-based methods
  isAdmin(): boolean {
    const role = this.userProfile()?.role;
    return role === 'admin' || role === 'dev'; // Dev has admin privileges
  }

  isStaff(): boolean {
    const role = this.userProfile()?.role;
    return role === 'admin' || role === 'staff' || role === 'dev'; // Dev has staff privileges
  }

  isDev(): boolean {
    return this.userProfile()?.role === 'dev';
  }

  isAuthorized(): boolean {
    return this.userProfile()?.isAuthorized === true;
  }

  // Get user stats
  getUserLoginCount(): number {
    return this.userProfile()?.loginCount || 0;
  }

  getUserCreatedDate(): Date | null {
    return this.userProfile()?.createdAt || null;
  }

  getUserLastLogin(): Date | null {
    return this.userProfile()?.lastLogin || null;
  }

  // Determine user role based on email
  private determineRole(email: string): 'admin' | 'staff' | 'member' | 'dev' {
    // Dev emails - full access for development
    if (email.includes('dev') || email.includes('developer') || 
        email.includes('test') || email === 'dev@ujeletbaptista.hu') {
      return 'dev';
    }
    // Admin emails
    if (email.includes('admin') || email === 'admin@ujeletbaptista.hu') {
      return 'admin';
    }
    // Staff emails
    if (email.includes('lelkesz') || email.includes('staff') || 
        email === 'lelkesz@ujeletbaptista.hu' || 
        email === 'staff@ujeletbaptista.hu') {
      return 'staff';
    }
    // Default to member
    return 'member';
  }
}
