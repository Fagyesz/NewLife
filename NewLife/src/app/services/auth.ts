import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
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

  /** Unsubscribe function for the realtime user-profile listener */
  private profileUnsubscribe: (() => void) | null = null;

  // Key used to cache the user profile in localStorage so we can display
  // the Google avatar and name instantly without waiting for Firestore.
  private static readonly LS_USER_PROFILE_KEY = 'cached-user-profile';

  constructor() {
    // Initialize auth state listener
    onAuthStateChanged(this.auth, async (user) => {
      this.user.set(user);
      
      if (user) {
        // Try to populate profile from cache for instant UI feedback.
        this.loadCachedUserProfile(user.uid);

        // Ensure we are listening to realtime changes on this profile
        this.startUserProfileListener(user.uid);

        // Load (or create) the document once so fields like loginCount are updated
        await this.loadOrCreateUserProfile(user);
      } else {
        this.userProfile.set(null);
        this.clearCachedUserProfile();
        // Cleanup listener when signed out
        if (this.profileUnsubscribe) {
          this.profileUnsubscribe();
          this.profileUnsubscribe = null;
        }
      }
    });
  }

  private async loadOrCreateUserProfile(user: User): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Support both "photoURL" and legacy "photoUrl" field names
        const rawData = userDoc.data() as any;
        const existingProfile = {
          ...rawData,
          uid: user.uid,
          lastLogin: new Date(),
          createdAt: rawData['createdAt']?.toDate?.() || new Date(),
          // Normalise the field so downstream code can safely use photoURL
          photoURL: rawData.photoURL || rawData.photoUrl || undefined
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
        const updatedProfileLocal: UserProfile = {
          ...existingProfile,
          displayName: user.displayName || existingProfile.displayName,
          photoURL: user.photoURL || existingProfile.photoURL,
          lastLogin: new Date(),
          loginCount: newLoginCount
        };
        
        this.userProfile.set(updatedProfileLocal);
        this.cacheUserProfile(updatedProfileLocal);
        
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
        this.cacheUserProfile(newProfile);
        
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
    
    // Default to guest
    return 'guest';
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
    const name = profile?.displayName;
    if (!name) return 'Ismeretlen felhasználó';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    const last = parts.pop();
    return `${last} ${parts.join(' ')}`.trim();
  }

  getUserEmail(): string {
    const profile = this.userProfile();
    return profile?.email || '';
  }

  /**
   * Returns the most appropriate avatar image for the currently signed-in user.
   * Order of preference:
   *   1. Photo URL stored in the user profile document (keeps updates made in Firestore)
   *   2. photoURL coming directly from the authenticated Firebase user object
   *   3. Local fallback image placed in public/icons/
   */
  getUserPhotoUrl(): string {
    const profilePhoto = this.userProfile()?.photoURL;
    const authPhoto = this.user()?.photoURL;
    // Some older documents might store the field as "photoUrl" (lowercase l).
    const legacyPhoto = (this.userProfile() as any)?.photoUrl as string | undefined;
    return profilePhoto || legacyPhoto || authPhoto || '/icons/icon-128x128-v2.png';
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

  /**
   * Listen to realtime changes of the signed-in user's document so role / authorization
   * updates made directly in Firestore Console reflect instantly in the app.
   */
  private startUserProfileListener(uid: string): void {
    // Tear down any previous listener first
    if (this.profileUnsubscribe) {
      this.profileUnsubscribe();
      this.profileUnsubscribe = null;
    }

    const userDocRef = doc(this.firestore, 'users', uid);
    this.profileUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Convert Firestore Timestamps to Date where necessary
        const updatedProfile: UserProfile = {
          uid,
          ...data,
          lastLogin: data['lastLogin']?.toDate?.() || new Date(data['lastLogin'] ?? Date.now()),
          createdAt: data['createdAt']?.toDate?.() || new Date(data['createdAt'] ?? Date.now())
        } as UserProfile;

        this.userProfile.set(updatedProfile);
        this.cacheUserProfile(updatedProfile);
        console.log('🔄 User profile updated via realtime listener:', updatedProfile.role);
      }
    }, (error) => {
      console.error('❌ Realtime user-profile listener error:', error);
    });
  }

  /** Loads a cached profile from localStorage (if any) to provide an immediate
   *  user experience while Firestore fetches fresh data. */
  private loadCachedUserProfile(uid: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(AuthService.LS_USER_PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        if (parsed && parsed.uid === uid) {
          this.userProfile.set(parsed);
        }
      }
    } catch {
      // Ignore JSON errors
    }
  }

  /** Persists the given profile to localStorage for quick retrieval next time. */
  private cacheUserProfile(profile: UserProfile): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(AuthService.LS_USER_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Quota or other errors – ignore, not critical
    }
  }

  private clearCachedUserProfile(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(AuthService.LS_USER_PROFILE_KEY);
  }
}
