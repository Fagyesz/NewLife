import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';
import { AuthService } from '../../services/auth';
import { BubblesComponent } from '../../shared/bubbles/bubbles';

@Component({
  selector: 'app-esemenyek',
  imports: [CommonModule, BubblesComponent],
  templateUrl: './esemenyek.html',
  styleUrl: './esemenyek.scss'
})
export class Esemenyek implements OnInit {
  private eventService = inject(EventService);
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  // Signals for reactive UI
  events = this.eventService.events;
  isLoading = signal(false);
  attendanceStates = signal<Map<string, boolean>>(new Map());

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

  getAttendanceCount(eventId: string): number {
    return this.attendanceService.getAttendanceCount(eventId);
  }

  hasMarkedAttendance(eventId: string): boolean {
    return this.attendanceStates().get(eventId) || false;
  }

  getAttendanceButtonText(eventId: string): string {
    return this.hasMarkedAttendance(eventId) ? 'Mégse' : 'Ott leszek';
  }

  getAttendanceButtonClass(eventId: string): string {
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
}
