import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UserProfile } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signals for reactive state
  user = signal<User | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal(false);

  constructor() {
    // Initialize auth state listener
    onAuthStateChanged(this.auth, async (user) => {
      this.user.set(user);
      
      if (user) {
        await this.loadOrCreateUserProfile(user);
      } else {
        this.userProfile.set(null);
      }
    });
  }

  private async loadOrCreateUserProfile(user: User): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing user
        const existingProfile = {
          ...userDoc.data(),
          uid: user.uid,
          lastLogin: new Date(),
          createdAt: userDoc.data()['createdAt']?.toDate() || new Date()
        } as UserProfile;
        
        // Increment login count
        const newLoginCount = (existingProfile.loginCount || 0) + 1;
        
        await updateDoc(userRef, {
          displayName: user.displayName || existingProfile.displayName,
          photoURL: user.photoURL || existingProfile.photoURL,
          lastLogin: new Date(),
          loginCount: newLoginCount
        });
        
        // Update local profile
        this.userProfile.set({
          ...existingProfile,
          displayName: user.displayName || existingProfile.displayName,
          photoURL: user.photoURL || existingProfile.photoURL,
          lastLogin: new Date(),
          loginCount: newLoginCount
        });
        
        console.log('👤 User profile updated:', user.email, 'Login count:', newLoginCount);
      } else {
        // Create new user profile
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Ismeretlen',
          photoURL: user.photoURL || undefined,
          role: this.determineUserRole(user.email || ''),
          isAuthorized: true, // Auto-authorize all users for now
          lastLogin: new Date(),
          createdAt: new Date(),
          loginCount: 1,
          provider: 'google'
        };
        
        await setDoc(userRef, newProfile);
        this.userProfile.set(newProfile);
        
        console.log('🆕 New user profile created:', user.email, 'Role:', newProfile.role);
      }
    } catch (error) {
      console.error('Error loading/creating user profile:', error);
    }
  }

  private determineUserRole(email: string): UserProfile['role'] {
    const lowerEmail = email.toLowerCase();
    
    // Dev role for development/testing
    if (lowerEmail.includes('dev') || 
        lowerEmail.includes('developer') || 
        lowerEmail.includes('test')) {
      return 'dev';
    }
    
    // Admin emails (configure these as needed)
    const adminEmails = [
      'admin@bapti.hu',
      'pastor@bapti.hu',
      'florianvincze7@gmail.com' // Your email
    ];
    
    if (adminEmails.includes(lowerEmail)) {
      return 'admin';
    }
    
    // Staff emails (configure these as needed)
    const staffEmails = [
      'staff@bapti.hu',
      'secretary@bapti.hu'
    ];
    
    if (staffEmails.includes(lowerEmail)) {
      return 'staff';
    }
    
    // Default to member
    return 'member';
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.isLoading.set(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🔐 Starting Google sign-in...');
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        console.log('✅ Google sign-in successful:', result.user.email);
        // User profile will be loaded automatically by onAuthStateChanged
      }
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('🚫 Sign-in cancelled by user');
        return; // Don't throw for user cancellation
      }
      
      throw new Error('Bejelentkezési hiba: ' + (error.message || 'Ismeretlen hiba'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      this.isLoading.set(true);
      console.log('🚪 Signing out...');
      await signOut(this.auth);
      console.log('✅ Sign-out successful');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('❌ Sign-out error:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Role checking methods
  isAuthenticated(): boolean {
    return !!this.user();
  }

  isAuthorized(): boolean {
    const profile = this.userProfile();
    return profile?.isAuthorized ?? false;
  }

  isAdmin(): boolean {
    const profile = this.userProfile();
    return profile?.role === 'admin' || profile?.role === 'dev';
  }

  isStaff(): boolean {
    const profile = this.userProfile();
    return profile?.role === 'staff' || profile?.role === 'admin' || profile?.role === 'dev';
  }

  isDev(): boolean {
    const profile = this.userProfile();
    return profile?.role === 'dev';
  }

  canManageUsers(): boolean {
    return this.isAdmin();
  }

  canEditContent(): boolean {
    return this.isStaff();
  }

  canDeleteEvents(): boolean {
    return this.isAdmin();
  }

  // Get user display info
  getUserDisplayName(): string {
    const profile = this.userProfile();
    return profile?.displayName || 'Ismeretlen felhasználó';
  }

  getUserEmail(): string {
    const profile = this.userProfile();
    return profile?.email || '';
  }

  getUserPhotoUrl(): string | undefined {
    const profile = this.userProfile();
    return profile?.photoURL;
  }

  getUserRole(): string {
    const profile = this.userProfile();
    switch (profile?.role) {
      case 'admin': return 'Adminisztrátor';
      case 'staff': return 'Személyzet';
      case 'member': return 'Tag';
      case 'dev': return 'Fejlesztő';
      default: return 'Ismeretlen';
    }
  }
}
