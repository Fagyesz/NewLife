import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs, addDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'staff' | 'member' | 'dev' | 'guest';
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
  scheduledPublishAt?: Date;  // Scheduled publishing date
  tillDate?: Date;  // Expiration date - when null, news doesn't expire
  isPublished: boolean;
  isActive: boolean;  // Manual active/inactive toggle
  isDraft: boolean;  // Draft status for scheduled content
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags: string[];  // Array of tags for better organization
  category: 'announcement' | 'event' | 'ministry' | 'general' | 'pastoral' | 'prayer_request' | 'testimony' | 'bible_study' | 'youth' | 'children' | 'missions' | 'volunteer' | 'community' | 'celebration';
  priority?: 'low' | 'normal' | 'high' | 'urgent';  // Priority for featured content
}

export interface UserStats {
  total: number;
  byRole: {
    admin: number;
    staff: number;
    member: number;
    dev: number;
    guest: number;
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
    byRole: { admin: 0, staff: 0, member: 0, dev: 0, guest: 0 },
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
      byRole: { admin: 0, staff: 0, member: 0, dev: 0, guest: 0 },
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

      // Optimistically update local signal so UI reflects change immediately
      const updatedUsers = this.users().map(u => u.uid === uid ? { ...u, role } : u);
      this.users.set(updatedUsers);
      this.updateStats(updatedUsers);

      console.log('✅ User role updated (local & remote):', uid, role);
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

  // ---------------------------------------------------------------------------
  // GDPR helpers for data portability / erasure
  // ---------------------------------------------------------------------------

  /**
   * Returns a JSON-serialisable snapshot of the currently signed-in user's data
   * (profile + any other collections you decide to add later).
   */
  async exportCurrentUserData(): Promise<any> {
    const user = this.authService.user();
    if (!user) throw new Error('Nincs bejelentkezve felhasználó');

    const profileSnap = await getDoc(doc(this.firestore, 'users', user.uid));
    const profile = profileSnap.exists() ? profileSnap.data() : null;

    return { profile };
  }

  /**
   * Permanently deletes the user's account and profile document. Note: Firebase
   * Auth may require recent login – handle re-authentication at call-site.
   */
  async deleteCurrentUserAccount(): Promise<void> {
    const user = this.authService.user();
    if (!user) throw new Error('Nincs bejelentkezve felhasználó');

    // Delete profile doc from Firestore
    await deleteDoc(doc(this.firestore, 'users', user.uid));
    // Delete auth record – user.delete() requires that this code runs client-side
    await user.delete();
  }
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for reactive state
  news = signal<News[]>([]);
  isLoading = signal(false);

  constructor() {
    this.loadNews();
  }

  private loadNews(): void {
    console.log('🔄 Starting to load news from Firestore...');
    try {
      const newsRef = collection(this.firestore, 'news');
      const q = query(newsRef, orderBy('publishedAt', 'desc'));
      
      console.log('📡 Setting up Firestore news listener...');
      onSnapshot(q, (snapshot) => {
        console.log('📦 Received Firestore snapshot with', snapshot.size, 'news documents');
        const newsItems: News[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newsItems.push({
            id: doc.id,
            ...data,
            publishedAt: data['publishedAt'].toDate(),
            scheduledPublishAt: data['scheduledPublishAt']?.toDate(),
            tillDate: data['tillDate']?.toDate(),
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate()
          } as News);
        });
        this.news.set(newsItems);
        console.log('✅ Successfully loaded', newsItems.length, 'news items from Firestore');
      }, (error) => {
        console.error('❌ Firebase news listener error:', error);
        console.log('🔄 Loading fallback news...');
        this.loadFallbackNews();
      });
    } catch (error) {
      console.error('❌ Failed to initialize news listener:', error);
      console.log('🔄 Loading fallback news...');
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
        isDraft: false,
        createdBy: 'system',
        category: 'event',
        tags: ['karácson', 'ünnepség', 'közösség'],
        priority: 'high'
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
        isDraft: false,
        createdBy: 'system',
        category: 'announcement',
        tags: ['újév', '2025', 'tervek'],
        priority: 'normal'
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
      
      // Handle special cases: explicitly remove fields when set to null
      const updateData: any = { updatedAt: new Date() };
      
      for (const [key, value] of Object.entries(updates)) {
        if ((key === 'tillDate' || key === 'scheduledPublishAt') && value === null) {
          // Use null to remove the field from Firebase
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

  // Get scheduled news (drafts with future publish dates)
  getScheduledNews(): News[] {
    const now = new Date();
    return this.news().filter(item => 
      item.isDraft && 
      item.scheduledPublishAt && 
      item.scheduledPublishAt > now
    );
  }

  // Get draft news (unpublished content that is NOT scheduled)
  getDraftNews(): News[] {
    const now = new Date();
    return this.news().filter(item => 
      item.isDraft && 
      (!item.scheduledPublishAt || item.scheduledPublishAt <= now)
    );
  }

  // Get news by tag
  getNewsByTag(tag: string): News[] {
    return this.news().filter(item => 
      item.tags.includes(tag)
    );
  }

  // Get news by priority
  getNewsByPriority(priority: News['priority']): News[] {
    return this.news().filter(item => 
      item.priority === priority
    );
  }

  // Get all unique tags
  getAllTags(): string[] {
    const allTags = new Set<string>();
    this.news().forEach(item => item.tags.forEach(tag => allTags.add(tag)));
    return Array.from(allTags);
  }

  // Check if news should be auto-published
  async checkAndPublishScheduledNews(): Promise<void> {
    const scheduledNews = this.getScheduledNews();
    const now = new Date();

    for (const newsItem of scheduledNews) {
      if (newsItem.id) {
        await this.updateNews(newsItem.id, {
          isPublished: true,
          isDraft: false,
          publishedAt: new Date()
        });
      }
    }
  }

  // Schedule news for future publishing
  async scheduleNews(newsId: string, scheduledDate: Date): Promise<void> {
    await this.updateNews(newsId, {
      scheduledPublishAt: scheduledDate,
      isDraft: true,
      isPublished: false
    });
  }

  // Publish news immediately
  async publishNewsNow(newsId: string): Promise<void> {
    await this.updateNews(newsId, {
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(),
      scheduledPublishAt: undefined
    });
  }

  loadMoreNews(): void {
    this.router.navigate(['/hirek']);
  }
}
