import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';
import { BubblesComponent } from '../../shared/bubbles/bubbles';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { LazyImgDirective } from '../../shared/directives/lazy-img.directive';
import { ConsentService } from '../../services/consent';
import { CookieConsentModal } from '../../shared/components/cookie-consent-modal';

@Component({
  selector: 'app-esemenyek',
  imports: [CommonModule, BubblesComponent, AnimateOnScrollDirective, LazyImgDirective, CookieConsentModal],
  templateUrl: './esemenyek.html',
  styleUrl: './esemenyek.scss'
})
export class Esemenyek implements OnInit {
  private eventService = inject(EventService);
  private attendanceService = inject(AttendanceService);
  private consentService = inject(ConsentService);

  // Signals for reactive UI
  events = this.eventService.events;
  isLoading = signal(false);
  attendanceStates = signal<Map<string, boolean>>(new Map());
  
  // Event modal state
  showEventModal = signal<boolean>(false);
  selectedEvent = signal<Event | null>(null);
  showConsentModal = signal(false);

  constructor() {
    // Reactively update attendance states whenever the events signal changes
    effect(() => {
      // Accessing the signal registers the dependency
      void this.events();
      // Fire-and-forget async refresh
      this.loadAttendanceStates();
    });
  }

  async ngOnInit() {
    await this.loadAttendanceStates();
  }

  private async loadAttendanceStates() {
    const events = this.events();
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
      if ((error as Error).message.includes('sütiket')) {
        this.showConsentModal.set(true);
      } else {
        alert('Hiba történt a részvétel jelzése során: ' + (error as Error).message);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  getAttendanceCount(eventId: string): number {
    return this.attendanceService.getAttendanceCount(eventId);
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

  getUpcomingEvents(): Event[] {
    return this.eventService.getUpcomingEvents();
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

  getEventMonth(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      month: 'short'
    }).format(date);
  }

  getEventDay(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      day: 'numeric'
    }).format(date);
  }

  getEventTime(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getEventWeekday(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      weekday: 'long'
    }).format(date);
  }

  getEventTypeIcon(type: Event['type']): string {
    switch (type) {
      case 'service': return '⛪';
      case 'meeting': return '👥';
      case 'special': return '🎄';
      default: return '📅';
    }
  }

  getEventTypeText(type: Event['type']): string {
    switch (type) {
      case 'service': return 'Istentisztelet';
      case 'meeting': return 'Gyűlés';
      case 'special': return 'Különleges alkalom';
      default: return 'Esemény';
    }
  }

  trackByEventId(index: number, event: Event): string {
    return event.id || index.toString();
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

  onImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
    }
  }

  // Google Calendar integration
  addToGoogleCalendar(event: Event): void {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.location || 'Új Élet Baptista Gyülekezet',
      trp: 'false' // Don't show popup
    });

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(googleCalendarUrl, '_blank');
  }

  onConsentAccepted() {
    this.showConsentModal.set(false);
  }

  closeConsentModal() {
    this.showConsentModal.set(false);
  }
}
