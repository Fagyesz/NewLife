import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs, addDoc, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from './auth';

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

export interface News {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;  // URL for the main news image
  author: string;
  publishedAt: Date;
  tillDate?: Date;  // Expiration date - when null, news doesn't expire
  isPublished: boolean;
  isActive: boolean;  // Manual active/inactive toggle
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  category?: 'announcement' | 'event' | 'ministry' | 'general' | 'pastoral' | 'prayer_request' | 'testimony' | 'bible_study' | 'youth' | 'children' | 'missions' | 'volunteer' | 'community' | 'celebration';
}

export interface UserStats {
  total: number;
  byRole: {
    admin: number;
    staff: number;
    member: number;
    dev: number;
  };
  authorized: number;
  unauthorized: number;
  activeToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  users = signal<UserProfile[]>([]);
  stats = signal<UserStats>({
    total: 0,
    byRole: { admin: 0, staff: 0, member: 0, dev: 0 },
    authorized: 0,
    unauthorized: 0,
    activeToday: 0
  });
  isLoading = signal(false);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      
      onSnapshot(q, (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            uid: doc.id,
            ...data,
            lastLogin: data['lastLogin']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date()
          } as UserProfile);
        });
        
        this.users.set(users);
        this.updateStats(users);
        console.log('👥 Loaded', users.length, 'users from Firestore');
      }, (error) => {
        console.error('Error loading users:', error);
      });
    } catch (error) {
      console.error('Failed to initialize users listener:', error);
    }
  }

  private updateStats(users: UserProfile[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats: UserStats = {
      total: users.length,
      byRole: { admin: 0, staff: 0, member: 0, dev: 0 },
      authorized: 0,
      unauthorized: 0,
      activeToday: 0
    };

    users.forEach(user => {
      stats.byRole[user.role]++;
      if (user.isAuthorized) stats.authorized++;
      else stats.unauthorized++;
      
      if (user.lastLogin >= today) {
        stats.activeToday++;
      }
    });

    this.stats.set(stats);
  }

  async updateUserRole(uid: string, role: UserProfile['role']): Promise<void> {
    if (!this.authService.isAdmin()) {
      throw new Error('Nincs jogosultsága felhasználók módosításához');
    }

    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, { role });
      console.log('✅ User role updated:', uid, role);
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  }

  async updateUserAuthorization(uid: string, isAuthorized: boolean): Promise<void> {
    if (!this.authService.isAdmin()) {
      throw new Error('Nincs jogosultsága felhasználói jogosultságok módosításához');
    }

    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, { isAuthorized });
      console.log('✅ User authorization updated:', uid, isAuthorized);
    } catch (error) {
      console.error('❌ Error updating user authorization:', error);
      throw error;
    }
  }

  getUsersByRole(role: UserProfile['role']): UserProfile[] {
    return this.users().filter(user => user.role === role);
  }

  getAuthorizedUsers(): UserProfile[] {
    return this.users().filter(user => user.isAuthorized);
  }

  getUnauthorizedUsers(): UserProfile[] {
    return this.users().filter(user => !user.isAuthorized);
  }

  getActiveUsers(days: number = 7): UserProfile[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return this.users().filter(user => user.lastLogin >= cutoff);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Signals for reactive state
  news = signal<News[]>([]);
  isLoading = signal(false);

  constructor() {
    this.loadNews();
  }

  private loadNews(): void {
    try {
      const newsRef = collection(this.firestore, 'news');
      const q = query(newsRef, orderBy('publishedAt', 'desc'));
      
      onSnapshot(q, (snapshot) => {
        const newsItems: News[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newsItems.push({
            id: doc.id,
            ...data,
            publishedAt: data['publishedAt'].toDate(),
            tillDate: data['tillDate']?.toDate(),
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate()
          } as News);
        });
        this.news.set(newsItems);
        console.log('📰 Loaded', newsItems.length, 'news items from Firestore');
      }, (error) => {
        console.warn('Firebase news listener error, loading fallback:', error);
        this.loadFallbackNews();
      });
    } catch (error) {
      console.warn('Failed to initialize news listener, loading fallback:', error);
      this.loadFallbackNews();
    }
  }

  private loadFallbackNews(): void {
    const fallbackNews: News[] = [
      {
        id: 'fallback-1',
        title: 'Karácsonyi ünnepség',
        content: 'Szeretettel várjuk Önt és családját karácsonyi ünnepségünkre. Különleges programmal és közös énekléssel készülünk.',
        summary: 'Karácsonyi ünnepség különleges programmal',
        author: 'Lelkész',
        publishedAt: new Date('2024-12-20T10:00:00'),
        tillDate: new Date('2024-12-26T23:59:59'),
        isPublished: true,
        isActive: true,
        createdBy: 'system',
        category: 'event'
      },
      {
        id: 'fallback-2', 
        title: 'Új év - új lehetőségek',
        content: 'Az új év sok új lehetőséget hoz magával. Gyülekezetünkben is újuló szívvel és buzgalommal várjuk a 2025-ös évet.',
        summary: 'Újévi köszöntő és tervek',
        author: 'Lelkész',
        publishedAt: new Date('2024-12-31T18:00:00'),
        isPublished: true,
        isActive: true,
        createdBy: 'system',
        category: 'announcement'
      }
    ];
    
    this.news.set(fallbackNews);
  }

  async createNews(newsItem: Omit<News, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.authService.isStaff()) {
      throw new Error('Nincs jogosultsága hírek létrehozásához');
    }

    try {
      this.isLoading.set(true);
      const userProfile = this.authService.userProfile();
      
      // Clean up data for Firebase - remove undefined values
      const cleanedNewsItem = Object.fromEntries(
        Object.entries(newsItem).filter(([_, value]) => value !== undefined)
      );
      
      const newsData = {
        ...cleanedNewsItem,
        createdBy: userProfile?.uid || '',
        author: newsItem.author || userProfile?.displayName || 'Ismeretlen',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('📰 Creating news:', newsData);
      const newsRef = collection(this.firestore, 'news');
      const docRef = await addDoc(newsRef, newsData);
      console.log('✅ News created successfully with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating news:', error);
      throw new Error('Hiba történt a hír létrehozása során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateNews(newsId: string, updates: Partial<News>): Promise<void> {
    if (!this.authService.isStaff()) {
      throw new Error('Nincs jogosultsága hírek módosításához');
    }

    try {
      this.isLoading.set(true);
      
      // Handle special case: if tillDate is explicitly set to null, we want to delete the field
      const updateData: any = { updatedAt: new Date() };
      
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'tillDate' && value === null) {
          // Use Firebase FieldValue.delete() to remove the field
          updateData[key] = null;
        } else if (value !== undefined) {
          updateData[key] = value;
        }
      }
      
      const newsRef = doc(this.firestore, 'news', newsId);
      await updateDoc(newsRef, updateData);
      
      console.log('✅ News updated successfully:', newsId);
    } catch (error) {
      console.error('❌ Error updating news:', error);
      throw new Error('Hiba történt a hír frissítése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteNews(newsId: string): Promise<void> {
    if (!this.authService.isAdmin()) {
      throw new Error('Nincs jogosultsága hírek törléséhez');
    }

    try {
      this.isLoading.set(true);
      const newsRef = doc(this.firestore, 'news', newsId);
      await deleteDoc(newsRef);
      console.log('✅ News deleted successfully:', newsId);
    } catch (error) {
      console.error('❌ Error deleting news:', error);
      throw new Error('Hiba történt a hír törlése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  getPublishedNews(): News[] {
    const now = new Date();
    return this.news().filter(item => 
      item.isPublished && 
      item.isActive && 
      (!item.tillDate || item.tillDate >= now)
    );
  }

  getNewsByCategory(category: News['category']): News[] {
    return this.news().filter(item => item.category === category);
  }

  getNewsById(id: string): News | undefined {
    return this.news().find(item => item.id === id);
  }

  getRecentNews(limit: number = 5): News[] {
    return this.getPublishedNews().slice(0, limit);
  }

  // Get news that are published but expired
  getExpiredNews(): News[] {
    const now = new Date();
    return this.news().filter(item => 
      item.isPublished && 
      item.tillDate && 
      item.tillDate < now
    );
  }

  // Get news that are manually deactivated
  getInactiveNews(): News[] {
    return this.news().filter(item => 
      item.isPublished && 
      !item.isActive
    );
  }

  // Get all news (published, draft, expired, inactive)
  getAllNews(): News[] {
    return this.news();
  }

  // Check if news is currently active (published, active, and not expired)
  isNewsActive(newsItem: News): boolean {
    const now = new Date();
    return newsItem.isPublished && 
           newsItem.isActive && 
           (!newsItem.tillDate || newsItem.tillDate >= now);
  }

  // Toggle news active status manually
  async toggleNewsActive(newsId: string): Promise<void> {
    const newsItem = this.getNewsById(newsId);
    if (!newsItem) {
      throw new Error('Hír nem található');
    }

    await this.updateNews(newsId, {
      isActive: !newsItem.isActive
    });
  }

  // Extend news expiration date
  async extendNewsExpiration(newsId: string, newTillDate: Date): Promise<void> {
    await this.updateNews(newsId, {
      tillDate: newTillDate
    });
  }

  // Remove expiration date (make news permanent until manually deactivated)
  async removeNewsExpiration(newsId: string): Promise<void> {
    await this.updateNews(newsId, {
      tillDate: undefined
    });
  }
}
