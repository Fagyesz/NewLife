import { Component, inject, OnInit, OnDestroy, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';
import { ConsentService } from '../../services/consent';
import { NewsService, News } from '../../services/user';
import { LiveStreamService } from '../../services/live-stream';
import { BubblesComponent } from '../../shared/bubbles/bubbles';
import { LazyImgDirective } from '../../shared/directives/lazy-img.directive';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner';
import { CookieConsentModal } from '../../shared/components/cookie-consent-modal';

@Component({
  selector: 'app-fooldal',
  imports: [CommonModule, RouterModule, BubblesComponent, LazyImgDirective, AnimateOnScrollDirective, LoadingSpinnerComponent, CookieConsentModal],
  templateUrl: './fooldal.html',
  styleUrl: './fooldal.scss'
})
export class Fooldal implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private attendanceService = inject(AttendanceService);
  private consentService = inject(ConsentService);
  private newsService = inject(NewsService);
  private liveStreamService = inject(LiveStreamService);
  private platformId = inject(PLATFORM_ID);
  
  // Signals for reactive state - computed from services
  upcomingEvents = computed(() => this.eventService.getUpcomingEvents().slice(0, 3));
  nextSundayService = computed(() => this.eventService.getNextSundayService() || null);
  countdownTimer = signal<string>('');
  isLive = computed(() => this.liveStreamService.isCurrentlyLive());
  liveStreamStatus = computed(() => this.liveStreamService.getCurrentStatus());
  latestNews = computed(() => this.newsService.getRecentNews(2));
  
  // Modal state
  showNewsModal = signal<boolean>(false);
  selectedNews = signal<News | null>(null);
  showEventModal = signal<boolean>(false);
  selectedEvent = signal<Event | null>(null);
  
  // Attendance state
  isLoading = signal(false);
  attendanceStates = signal<Map<string, boolean>>(new Map());
  
  // Loading states for different sections
  eventsLoading = signal(false);
  newsLoading = signal(false);
  
  // Consent modal state
  showConsentModal = signal(false);
  
  private countdownInterval: any;

  async ngOnInit(): Promise<void> {
    // Only start client-side features in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.startCountdown();
      this.checkLiveStatus();
    }
    await this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    // Simulate loading with animated logo
    this.eventsLoading.set(true);
    this.newsLoading.set(true);
    
    try {
      // Add small delay to show the animated logo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.loadAttendanceStates();
      
      this.eventsLoading.set(false);
      this.newsLoading.set(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.eventsLoading.set(false);
      this.newsLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private async loadAttendanceStates() {
    const events = this.upcomingEvents();
    const states = new Map<string, boolean>();
    
    for (const event of events) {
      if (event.id) {
        const hasAttended = await this.attendanceService.hasMarkedAttendance(event.id);
        states.set(event.id, hasAttended);
      }
    }
    
    this.attendanceStates.set(states);
  }

  async toggleAttendance(event: Event) {
    if (!event.id) return;

    if (!this.consentService.hasAnalyticsConsent()) {
      this.showConsentModal.set(true);
      return;
    }

    try {
      this.isLoading.set(true);
      const currentState = this.attendanceStates().get(event.id) || false;
      
      if (currentState) {
        await this.attendanceService.removeAttendance(event.id);
      } else {
        await this.attendanceService.markAttendance(event.id);
      }
      
      // Update local state
      const newStates = new Map(this.attendanceStates());
      newStates.set(event.id, !currentState);
      this.attendanceStates.set(newStates);
      
    } catch (error) {
      console.error('Error toggling attendance:', error);
      alert('Hiba történt a részvétel jelzése során: ' + (error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  hasMarkedAttendance(eventId: string): boolean {
    return this.attendanceStates().get(eventId) || false;
  }

  getAttendanceButtonText(eventId: string): string {
    if (!this.consentService.hasAnalyticsConsent()) {
      return 'Fogadja el a sütiket';
    }
    return this.hasMarkedAttendance(eventId) ? 'Mégse' : 'Ott leszek';
  }

  getAttendanceButtonClass(eventId: string): string {
    if (!this.consentService.hasAnalyticsConsent()) {
      return 'btn btn-secondary disabled';
    }
    return this.hasMarkedAttendance(eventId) ? 'btn btn-secondary' : 'btn btn-primary';
  }

  private startCountdown(): void {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    const nextSunday = this.getNextSunday();
    const now = new Date();
    const diff = nextSunday.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownTimer.set('Istentisztelet folyamatban');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      this.countdownTimer.set(`${days} nap, ${hours} óra`);
    } else if (hours > 0) {
      this.countdownTimer.set(`${hours} óra, ${minutes} perc`);
    } else {
      this.countdownTimer.set(`${minutes} perc, ${seconds} másodperc`);
    }
  }

  private getNextSunday(): Date {
    const now = new Date();
    const nextSunday = new Date();
    
    // Set to next Sunday at 10:00 AM
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(10, 0, 0, 0);
    
    // If it's Sunday and before 11:00 AM, use today
    if (now.getDay() === 0 && now.getHours() < 11) {
      nextSunday.setDate(now.getDate());
    }
    
    return nextSunday;
  }

  private checkLiveStatus(): void {
    // Live status is now handled by LiveStreamService
    // No need to manually set the status - it's computed from the service
  }

  // Helper methods for template
  formatEventDate(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getAttendanceCount(eventId: string): number {
    return this.attendanceService.getAttendanceCount(eventId);
  }

  formatNewsDate(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      default: return 'Hír';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'announcement': return '📢';
      case 'event': return '🎄';
      case 'ministry': return '🙏';
      case 'general': return '📰';
      case 'pastoral': return '✝️';
      case 'prayer_request': return '🙏';
      case 'testimony': return '💬';
      case 'bible_study': return '📖';
      case 'youth': return '👨‍👩‍👧‍👦';
      case 'children': return '👶';
      case 'missions': return '🌍';
      case 'volunteer': return '🤝';
      case 'community': return '👥';
      case 'celebration': return '🎉';
      default: return '📝';
    }
  }

  getEventTypeIcon(type: string): string {
    switch (type) {
      case 'service': return '⛪';
      case 'meeting': return '👥';
      case 'special': return '🌟';
      case 'bible_study': return '📖';
      case 'prayer_meeting': return '🙏';
      case 'youth': return '👨‍👩‍👧‍👦';
      case 'children': return '👶';
      case 'baptism': return '💧';
      case 'wedding': return '💒';
      case 'funeral': return '🕊️';
      case 'concert': return '🎵';
      case 'conference': return '🎤';
      case 'outreach': return '📢';
      case 'fellowship': return '🤝';
      case 'training': return '📚';
      default: return '📅';
    }
  }

  onImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
    }
  }

  // Modal methods
  openNewsModal(news: News): void {
    this.selectedNews.set(news);
    this.showNewsModal.set(true);
  }

  closeNewsModal(): void {
    this.showNewsModal.set(false);
    this.selectedNews.set(null);
  }

  // Event modal methods
  openEventModal(event: Event): void {
    this.selectedEvent.set(event);
    this.showEventModal.set(true);
  }

  closeEventModal(): void {
    this.showEventModal.set(false);
    this.selectedEvent.set(null);
  }

  getEventTypeText(type: string): string {
    switch (type) {
      case 'service': return 'Istentisztelet';
      case 'meeting': return 'Gyülekezeti összejövetel';
      case 'special': return 'Különleges alkalom';
      case 'bible_study': return 'Bibliaóra';
      case 'prayer_meeting': return 'Imaóra';
      case 'youth': return 'Ifjúsági alkalom';
      case 'children': return 'Gyermek program';
      case 'baptism': return 'Keresztelő';
      case 'wedding': return 'Esküvő';
      case 'funeral': return 'Temetés';
      case 'concert': return 'Koncert';
      case 'conference': return 'Konferencia';
      case 'outreach': return 'Evangelizáció';
      case 'fellowship': return 'Közösség';
      case 'training': return 'Képzés';
      default: return 'Esemény';
    }
  }

  getNewsExcerpt(content: string, maxLength: number = 150): string {
    if (!content) {
      return '';
    }

    // Helper to clean HTML to plain text
    const stripHtml = (html: string): string => {
      return html
        .replace(/<[^>]+>/g, '')      // remove tags
        .replace(/&nbsp;/g, ' ')      // replace &nbsp;
        .replace(/\s+/g, ' ')         // collapse whitespace
        .trim();
    };

    // Convert to plain text depending on platform
    let text: string;
    if (isPlatformBrowser(this.platformId)) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      text = (tempDiv.textContent || tempDiv.innerText || '').trim();
      text = text.replace(/\s+/g, ' '); // collapse whitespace
    } else {
      text = stripHtml(content);
    }

    if (text.length <= maxLength) {
      return text;
    }

    // Cut to maxLength but try not to break words
    let truncated = text.slice(0, maxLength);

    // If we are in the middle of a word, remove the partial word
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength - 15) { // tolerance so we don't remove too much
      truncated = truncated.slice(0, lastSpace);
    }

    // Remove dangling punctuation (common opening chars, commas, etc.)
    truncated = truncated.replace(/[\s,;:!?.\-+()\[\{]+$/g, '');

    return truncated + '...';
  }

  // Live stream helper methods
  getLiveStreamTitle(): string {
    return this.liveStreamService.getStreamTitle();
  }

  getLiveViewerCount(): number {
    return this.liveStreamService.getViewerCount();
  }

  getLiveStreamDuration(): string | null {
    return this.liveStreamService.getTimeSinceStart();
  }

  getLiveStatusText(): string {
    const status = this.liveStreamStatus();
    if (status.isLive) {
      return `Élőben ${this.getLiveStreamDuration() || ''}`;
    }
    return 'Jelenleg nincs élő közvetítés';
  }

  refreshLiveStatus() {
    this.liveStreamService.checkLiveStatus();
  }

  // Google Calendar integration
  addToGoogleCalendar(event: Event): void {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startTime = formatDate(event.date);
    // Assume event is 2 hours long
    const endTime = formatDate(new Date(event.date.getTime() + 2 * 60 * 60 * 1000));
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  }

  loadMoreNews() {
    this.newsService.loadMoreNews();
  }

  // Consent modal handlers
  onConsentAccepted() {
    this.showConsentModal.set(false);
  }

  closeConsentModal() {
    this.showConsentModal.set(false);
  }
}
