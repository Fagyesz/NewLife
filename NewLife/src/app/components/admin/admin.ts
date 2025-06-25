import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  authService = inject(AuthService);
  private eventService = inject(EventService);
  private attendanceService = inject(AttendanceService);
  userService = inject(UserService);
  private router = inject(Router);

  // Signals
  showEventForm = signal(false);
  showUsersSection = signal(false);
  showEventsSection = signal(false);
  editingEvent = signal<Event | null>(null);
  isLoading = signal(false);

  // Form data
  eventForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'service' as Event['type'],
    location: ''
  };

  ngOnInit() {
    if (!this.authService.isStaff()) {
      this.router.navigate(['/']);
      return;
    }
  }

  get events() {
    return this.eventService.events();
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

  get upcomingEvents() {
    const now = new Date();
    return this.events.filter(event => event.date >= now);
  }

  get pastEvents() {
    const now = new Date();
    return this.events.filter(event => event.date < now);
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
        location: event.location
      };
    } else {
      this.editingEvent.set(null);
      this.resetForm();
    }
    this.showEventForm.set(true);
  }

  closeEventForm() {
    this.showEventForm.set(false);
    this.editingEvent.set(null);
    this.resetForm();
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
        location: this.eventForm.location
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
      case 'admin': return 'Admin';
      case 'staff': return 'Személyzet';
      case 'dev': return 'Fejlesztő';
      default: return 'Tag';
    }
  }

  private resetForm() {
    this.eventForm = {
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'service',
      location: 'Gyöngyös Gyüli' // Default location
    };
  }
}
