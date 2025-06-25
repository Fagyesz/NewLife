import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';
import { UserProfile } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);

  // Signals for reactive state
  users = signal<UserProfile[]>([]);
  isLoading = signal(false);
  private firebaseConnected = signal(false);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, orderBy('lastLogin', 'desc'));
      
      onSnapshot(q, (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            ...data,
            uid: doc.id,
            lastLogin: data['lastLogin'].toDate(), // Convert Firestore timestamp to Date
            createdAt: data['createdAt'].toDate(),
          } as UserProfile);
        });
        this.users.set(users);
        this.firebaseConnected.set(true);
        console.log('👥 Loaded', users.length, 'users from Firestore');
      }, (error) => {
        console.warn('Firebase users connection error:', error);
        this.firebaseConnected.set(false);
      });
    } catch (error) {
      console.warn('Failed to initialize users listener:', error);
      this.firebaseConnected.set(false);
    }
  }

  async updateUserRole(uid: string, newRole: UserProfile['role']): Promise<void> {
    if (!this.firebaseConnected()) {
      throw new Error('Firebase kapcsolat nem elérhető');
    }

    try {
      this.isLoading.set(true);
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      console.log('👤 User role updated:', uid, newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateUserAuthorization(uid: string, isAuthorized: boolean): Promise<void> {
    if (!this.firebaseConnected()) {
      throw new Error('Firebase kapcsolat nem elérhető');
    }

    try {
      this.isLoading.set(true);
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, { isAuthorized });
      console.log('👤 User authorization updated:', uid, isAuthorized);
    } catch (error) {
      console.error('Error updating user authorization:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Get users by role
  getUsersByRole(role: UserProfile['role']): UserProfile[] {
    return this.users().filter(user => user.role === role);
  }

  // Get recent users (last 30 days)
  getRecentUsers(): UserProfile[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.users().filter(user => user.lastLogin >= thirtyDaysAgo);
  }

  // Get active users (logged in this week)
  getActiveUsers(): UserProfile[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.users().filter(user => user.lastLogin >= oneWeekAgo);
  }

  // Get user statistics
  getUserStats() {
    const users = this.users();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      staff: users.filter(u => u.role === 'staff').length,
      members: users.filter(u => u.role === 'member').length,
      devs: users.filter(u => u.role === 'dev').length,
      activeThisWeek: users.filter(u => u.lastLogin >= oneWeekAgo).length,
      activeThisMonth: users.filter(u => u.lastLogin >= oneMonthAgo).length,
      totalLogins: users.reduce((sum, user) => sum + (user.loginCount || 0), 0)
    };
  }

  isFirebaseConnected(): boolean {
    return this.firebaseConnected();
  }
}
