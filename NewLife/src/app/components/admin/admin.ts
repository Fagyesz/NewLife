import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { AuthService } from '../../services/auth';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';
import { UserService, NewsService, News } from '../../services/user';
import { TestModeService } from '../../services/test-mode';
import { LiveStreamService } from '../../services/live-stream';
import { BubblesComponent } from '../../shared/bubbles/bubbles';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, QuillModule, BubblesComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  authService = inject(AuthService);
  testModeService = inject(TestModeService);
  liveStreamService = inject(LiveStreamService);
  private eventService = inject(EventService);
  private attendanceService = inject(AttendanceService);
  userService = inject(UserService);
  private newsService = inject(NewsService);
  private router = inject(Router);

  // Signals
  showEventForm = signal(false);
  showNewsForm = signal(false);
  showUsersSection = signal(false);
  showEventsSection = signal(false);
  showNewsSection = signal(false);
  editingEvent = signal<Event | null>(null);
  editingNews = signal<News | null>(null);
  isLoading = signal(false);

  // Quill editor configuration 
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ],
    theme: 'snow',
    bounds: document.body,
    scrollingContainer: null
  };

  // Form data
  eventForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'service' as Event['type'],
    location: '',
    imageUrl: ''
  };

  newsForm = {
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    author: '',
    publishedAt: '',
    scheduledPublishAt: '',
    tillDate: '',
    isPublished: true,
    isActive: true,
    isDraft: false,
    category: 'general' as News['category'],
    tags: [] as string[],
    tagInput: '',
    priority: 'normal' as News['priority'],
    publishOption: 'draft' as 'draft' | 'publish' | 'schedule'
  };

  ngOnInit() {
    if (!this.authService.isStaff()) {
      this.router.navigate(['/']);
      return;
    }
    if (this.authService.isDev()) {
      this.testModeService.checkStatus();
      this.testModeService.checkHealth();
      this.liveStreamService.checkLiveStatus();
    }
  }

  get events() {
    return this.eventService.events();
  }

  get news() {
    return this.newsService.news();
  }

  get users() {
    return this.userService.users();
  }

  get userStats() {
    return this.userService.stats();
  }

  get attendanceStats() {
    return this.attendanceService.getAttendanceStats();
  }

  toggleUsersSection() {
    this.showUsersSection.set(!this.showUsersSection());
  }

  toggleEventsSection() {
    this.showEventsSection.set(!this.showEventsSection());
  }

  toggleNewsSection() {
    this.showNewsSection.set(!this.showNewsSection());
  }

  get upcomingEvents() {
    const now = new Date();
    return this.events.filter(event => event.date >= now);
  }

  get pastEvents() {
    const now = new Date();
    return this.events.filter(event => event.date < now);
  }

  get publishedNews() {
    return this.news.filter(item => 
      item.isPublished && 
      item.isActive && 
      this.newsService.isNewsActive(item)
    );
  }

  get expiredNews() {
    return this.newsService.getExpiredNews();
  }

  get inactiveNews() {
    return this.newsService.getInactiveNews();
  }

  openEventForm(event?: Event) {
    if (event) {
      this.editingEvent.set(event);
      this.eventForm = {
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.date.toTimeString().slice(0, 5),
        type: event.type,
        location: event.location,
        imageUrl: event.imageUrl || ''
      };
    } else {
      this.editingEvent.set(null);
      this.resetEventForm();
    }
    this.showEventForm.set(true);
  }

  closeEventForm() {
    this.showEventForm.set(false);
    this.editingEvent.set(null);
    this.resetEventForm();
  }

  openNewsForm(news?: News) {
    if (news) {
      this.editingNews.set(news);
      // Determine publishOption based on existing news state
      let publishOption: 'draft' | 'publish' | 'schedule' = 'draft';
      const now = new Date();
      if (news.scheduledPublishAt && news.isDraft && news.scheduledPublishAt > now) {
        publishOption = 'schedule';
      } else if (news.isPublished && !news.isDraft) {
        publishOption = 'publish';
      } else {
        publishOption = 'draft';
      }
      
      this.newsForm = {
        title: news.title,
        content: news.content,
        summary: news.summary || '',
        imageUrl: news.imageUrl || '',
        author: news.author,
        publishedAt: news.publishedAt.toISOString().split('T')[0],
        scheduledPublishAt: news.scheduledPublishAt ? news.scheduledPublishAt.toISOString().split('T')[0] : '',
        tillDate: news.tillDate ? news.tillDate.toISOString().split('T')[0] : '',
        isPublished: news.isPublished,
        isActive: news.isActive,
        isDraft: news.isDraft,
        category: news.category,
        tags: [...news.tags],
        tagInput: '',
        priority: news.priority || 'normal',
        publishOption: publishOption
      };
    } else {
      this.editingNews.set(null);
      this.resetNewsForm();
    }
    this.showNewsForm.set(true);
  }

  closeNewsForm() {
    this.showNewsForm.set(false);
    this.editingNews.set(null);
    this.resetNewsForm();
  }

  async saveEvent() {
    if (!this.eventForm.title || !this.eventForm.date || !this.eventForm.time) {
      alert('Kérjük, töltse ki az összes kötelező mezőt!');
      return;
    }

    try {
      this.isLoading.set(true);
      
      const eventDateTime = new Date(`${this.eventForm.date}T${this.eventForm.time}`);
      
      const eventData = {
        title: this.eventForm.title,
        description: this.eventForm.description,
        date: eventDateTime,
        type: this.eventForm.type,
        location: this.eventForm.location,
        imageUrl: this.eventForm.imageUrl
      };

      const editingEvent = this.editingEvent();
      if (editingEvent?.id) {
        await this.eventService.updateEvent(editingEvent.id, eventData);
      } else {
        await this.eventService.createEvent(eventData);
      }

      this.closeEventForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Hiba történt az esemény mentése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteEvent(event: Event) {
    if (!event.id) return;
    
    if (!confirm(`Biztosan törölni szeretné a "${event.title}" eseményt?`)) {
      return;
    }

    try {
      this.isLoading.set(true);
      await this.eventService.deleteEvent(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Hiba történt az esemény törlése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateUserRole(uid: string, newRole: any) {
    try {
      await this.userService.updateUserRole(uid, newRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Hiba történt a szerepkör módosítása során: ' + (error as Error).message);
    }
  }

  async toggleUserAuthorization(uid: string, currentAuth: boolean) {
    try {
      await this.userService.updateUserAuthorization(uid, !currentAuth);
    } catch (error) {
      console.error('Error updating user authorization:', error);
      alert('Hiba történt a jogosultság módosítása során: ' + (error as Error).message);
    }
  }

  getEventAttendance(eventId: string): number {
    return this.attendanceService.getAttendanceCount(eventId);
  }

  formatEventDate(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatUserDate(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Adminisztrátor';
      case 'staff': return 'Személyzet';
      case 'dev': return 'Fejlesztő';
      case 'member': return 'Tag';
      case 'guest': return 'Vendég';
      default: return 'Ismeretlen';
    }
  }

  async saveNews() {
    if (!this.newsForm.title || !this.newsForm.content) {
      alert('Kérjük, töltse ki a cím és tartalom mezőket!');
      return;
    }

    // Validate scheduled publishing
    if (this.newsForm.publishOption === 'schedule' && !this.newsForm.scheduledPublishAt) {
      alert('Kérjük, adja meg az ütemezett publikálás dátumát!');
      return;
    }

    try {
      this.isLoading.set(true);
      
      const publishDate = this.newsForm.publishedAt ? new Date(this.newsForm.publishedAt) : new Date();
      
      // Handle tillDate - set to end of day in local timezone
      let tillDate: Date | undefined = undefined;
      if (this.newsForm.tillDate) {
        tillDate = new Date(this.newsForm.tillDate + 'T23:59:59');
      }
      
      // Handle scheduled publishing
      let scheduledPublishAt: Date | undefined = undefined;
      if (this.newsForm.publishOption === 'schedule' && this.newsForm.scheduledPublishAt) {
        scheduledPublishAt = new Date(this.newsForm.scheduledPublishAt + 'T09:00:00');
      }

      // Set publish flags based on publishOption
      let isPublished: boolean;
      let isDraft: boolean;
      
      switch (this.newsForm.publishOption) {
        case 'publish':
          isPublished = true;
          isDraft = false;
          // Clear scheduled date when publishing immediately
          scheduledPublishAt = undefined;
          break;
        case 'schedule':
          isPublished = false;
          isDraft = true;
          break;
        case 'draft':
        default:
          isPublished = false;
          isDraft = true;
          // Clear scheduled date when switching to draft
          scheduledPublishAt = undefined;
          break;
      }

      const newsData = {
        title: this.newsForm.title,
        content: this.newsForm.content,
        summary: this.newsForm.summary,
        imageUrl: this.newsForm.imageUrl,
        author: this.newsForm.author || this.authService.getUserDisplayName(),
        publishedAt: publishDate,
        scheduledPublishAt: scheduledPublishAt,
        tillDate: tillDate,
        isPublished: isPublished,
        isActive: this.newsForm.isActive,
        isDraft: isDraft,
        category: this.newsForm.category,
        tags: this.newsForm.tags,
        priority: this.newsForm.priority
      };

      const editingNews = this.editingNews();
      if (editingNews?.id) {
        // Special handling for updates - need to explicitly remove fields when switching modes
        const updateData = { ...newsData };
        
        // Remove tillDate if form field is empty but news had a tillDate
        if (!this.newsForm.tillDate && editingNews.tillDate) {
          updateData.tillDate = null as any;
        }
        
        // Remove scheduledPublishAt when switching away from schedule mode
        if (this.newsForm.publishOption !== 'schedule' && editingNews.scheduledPublishAt) {
          updateData.scheduledPublishAt = null as any;
        }
        
        await this.newsService.updateNews(editingNews.id, updateData);
      } else {
        await this.newsService.createNews(newsData);
      }

      this.closeNewsForm();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Hiba történt a hír mentése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteNews(news: News) {
    if (!news.id) return;
    
    if (!confirm(`Biztosan törölni szeretné a "${news.title}" hírt?`)) {
      return;
    }

    try {
      this.isLoading.set(true);
      await this.newsService.deleteNews(news.id);
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Hiba történt a hír törlése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatNewsDate(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getCategoryText(category: string): string {
    switch (category) {
      case 'announcement': return 'Közlemény';
      case 'event': return 'Esemény';
      case 'ministry': return 'Szolgálat';
      case 'general': return 'Általános';
      case 'pastoral': return 'Lelkészi üzenet';
      case 'prayer_request': return 'Imakérés';
      case 'testimony': return 'Bizonyságtétel';
      case 'bible_study': return 'Bibliaóra';
      case 'youth': return 'Ifjúsági';
      case 'children': return 'Gyermek';
      case 'missions': return 'Misszió';
      case 'volunteer': return 'Önkéntes munka';
      case 'community': return 'Közösség';
      case 'celebration': return 'Ünneplés';
      default: return 'Általános';
    }
  }

  isNewsExpired(newsItem: News): boolean {
    if (!newsItem.tillDate) return false;
    return newsItem.tillDate < new Date();
  }

  async reactivateNews(newsItem: News) {
    if (!newsItem.id) return;
    
    try {
      this.isLoading.set(true);
      
      // Extend expiration by 30 days or make it active again
      const newTillDate = new Date();
      newTillDate.setDate(newTillDate.getDate() + 30);
      
      await this.newsService.updateNews(newsItem.id, {
        isActive: true,
        tillDate: newTillDate
      });
      
      console.log('News reactivated:', newsItem.id);
    } catch (error) {
      console.error('Error reactivating news:', error);
      alert('Hiba történt a hír újraaktiválása során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async extendNewsExpiration(newsItem: News, days: number = 30) {
    if (!newsItem.id) return;
    
    try {
      this.isLoading.set(true);
      
      const newTillDate = new Date();
      newTillDate.setDate(newTillDate.getDate() + days);
      
      await this.newsService.updateNews(newsItem.id, {
        tillDate: newTillDate,
        isActive: true
      });
      
      console.log('News expiration extended:', newsItem.id);
    } catch (error) {
      console.error('Error extending news expiration:', error);
      alert('Hiba történt a lejárat meghosszabbítása során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async makeNewsPermanent(newsItem: News) {
    if (!newsItem.id) return;
    
    try {
      this.isLoading.set(true);
      
      await this.newsService.updateNews(newsItem.id, {
        tillDate: null as any,
        isActive: true
      });
      
      console.log('News made permanent:', newsItem.id);
    } catch (error) {
      console.error('Error making news permanent:', error);
      alert('Hiba történt a hír állandóvá tétele során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleNewsActive(newsItem: News) {
    if (!newsItem.id) return;
    
    try {
      this.isLoading.set(true);
      
      await this.newsService.updateNews(newsItem.id, {
        isActive: !newsItem.isActive
      });
      
      console.log('News active status toggled:', newsItem.id);
    } catch (error) {
      console.error('Error toggling news active status:', error);
      alert('Hiba történt a hír állapotának váltása során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  getEventTypeText(type: string): string {
    switch (type) {
      case 'service': return 'Istentisztelet';
      case 'meeting': return 'Gyűlés';
      case 'special': return 'Különleges alkalom';
      case 'bible_study': return 'Bibliaóra';
      case 'prayer_meeting': return 'Imaalalom';
      case 'youth': return 'Ifjúsági program';
      case 'children': return 'Gyermekprogram';
      case 'baptism': return 'Keresztelő';
      case 'wedding': return 'Esküvő';
      case 'funeral': return 'Temetés';
      case 'concert': return 'Koncert';
      case 'conference': return 'Konferencia';
      case 'outreach': return 'Evangelizáció';
      case 'fellowship': return 'Közösségi program';
      case 'training': return 'Képzés';
      default: return 'Esemény';
    }
  }

  private resetEventForm() {
    this.eventForm = {
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'service',
      location: 'Gyöngyös Gyüli', // Default location
      imageUrl: ''
    };
  }

  private resetNewsForm() {
    this.newsForm = {
      title: '',
      content: '',
      summary: '',
      imageUrl: '',
      author: this.authService.getUserDisplayName(),
      publishedAt: new Date().toISOString().split('T')[0],
      scheduledPublishAt: '',
      tillDate: '',
      isPublished: false,
      isActive: true,
      isDraft: true,
      category: 'general',
      tags: [],
      tagInput: '',
      priority: 'normal',
      publishOption: 'draft'
    };
  }

  // Tag management methods
  addTag(): void {
    const tag = this.newsForm.tagInput.trim().toLowerCase();
    if (tag && !this.newsForm.tags.includes(tag)) {
      this.newsForm.tags.push(tag);
      this.newsForm.tagInput = '';
    }
  }

  removeTag(index: number): void {
    this.newsForm.tags.splice(index, 1);
  }

  onTagInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onPublishOptionChange(): void {
    // Clear scheduled date when switching away from schedule mode
    if (this.newsForm.publishOption !== 'schedule') {
      this.newsForm.scheduledPublishAt = '';
    }
  }

  get availableTags(): string[] {
    try {
      const tags = this.newsService?.getAllTags?.();
      return Array.isArray(tags) ? tags : [];
    } catch (error) {
      console.warn('Error getting available tags:', error);
      return [];
    }
  }

  get scheduledNews() {
    try {
      return this.newsService.getScheduledNews() || [];
    } catch (error) {
      console.warn('Error getting scheduled news:', error);
      return [];
    }
  }

  get draftNews() {
    try {
      return this.newsService.getDraftNews() || [];
    } catch (error) {
      console.warn('Error getting draft news:', error);
      return [];
    }
  }

  async publishScheduledNews(newsItem: News): Promise<void> {
    if (!newsItem.id) return;
    await this.newsService.publishNewsNow(newsItem.id);
  }

  async scheduleNewsItem(newsItem: News, days: number): Promise<void> {
    if (!newsItem.id) return;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + days);
    await this.newsService.scheduleNews(newsItem.id, scheduledDate);
  }

  // Modal overlay click handling
  private mouseDownTarget: EventTarget | null = null;

  onModalOverlayMouseDown(event: MouseEvent): void {
    this.mouseDownTarget = event.target;
  }

  onModalOverlayMouseUp(event: MouseEvent, modalType: 'news' | 'event'): void {
    // Only close modal if both mousedown and mouseup happened on the overlay (not dragged from inside)
    if (this.mouseDownTarget === event.target && event.target === event.currentTarget) {
      if (modalType === 'news') {
        this.closeNewsForm();
      } else if (modalType === 'event') {
        this.closeEventForm();
      }
    }
    // Reset the tracking
    this.mouseDownTarget = null;
  }

  /**
   * Ensures every user avatar has a valid source. If the remote URL fails to
   * load we replace it with a local fallback.
   */
  onUserImgError(event: Event): void {
    const imgEl = (event as any).target as (HTMLImageElement | null);
    if (!imgEl) return;
    imgEl.onerror = null; // avoid infinite loop
    imgEl.src = '/icons/icon-128x128-v2.png';
  }

  /** Returns display name with last name first */
  reverseName(name: string | undefined | null): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    const last = parts.pop();
    return `${last} ${parts.join(' ')}`.trim();
  }

  /** Extracts clean text from HTML content for display in cards */
  getCleanTextSummary(newsItem: News): string {
    if (newsItem.summary) {
      return newsItem.summary;
    }
    
    if (!newsItem.content) {
      return 'Nincs tartalom...';
    }
    
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newsItem.content;
    
    // Get text content and clean it up
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Remove extra whitespace and line breaks
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    // Limit to 100 characters
    if (textContent.length > 100) {
      textContent = textContent.substring(0, 100) + '...';
    }
    
    return textContent || 'Nincs tartalom...';
  }

}
