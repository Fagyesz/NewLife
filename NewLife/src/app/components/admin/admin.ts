import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';
import { UserService, NewsService, News } from '../../services/user';

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

  // Form data
  eventForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'service' as Event['type'],
    location: ''
  };

  newsForm = {
    title: '',
    content: '',
    summary: '',
    author: '',
    publishedAt: '',
    isPublished: true,
    category: 'general' as News['category']
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
    return this.news.filter(item => item.isPublished);
  }

  get unpublishedNews() {
    return this.news.filter(item => !item.isPublished);
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
      this.newsForm = {
        title: news.title,
        content: news.content,
        summary: news.summary || '',
        author: news.author,
        publishedAt: news.publishedAt.toISOString().split('T')[0],
        isPublished: news.isPublished,
        category: news.category || 'general'
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

  async saveNews() {
    if (!this.newsForm.title || !this.newsForm.content) {
      alert('Kérjük, töltse ki a cím és tartalom mezőket!');
      return;
    }

    try {
      this.isLoading.set(true);
      
      const publishDate = this.newsForm.publishedAt ? new Date(this.newsForm.publishedAt) : new Date();
      
      const newsData = {
        title: this.newsForm.title,
        content: this.newsForm.content,
        summary: this.newsForm.summary,
        author: this.newsForm.author || this.authService.getUserDisplayName(),
        publishedAt: publishDate,
        isPublished: this.newsForm.isPublished,
        category: this.newsForm.category
      };

      const editingNews = this.editingNews();
      if (editingNews?.id) {
        await this.newsService.updateNews(editingNews.id, newsData);
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
      default: return 'Általános';
    }
  }

  private resetEventForm() {
    this.eventForm = {
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'service',
      location: 'Gyöngyös Gyüli' // Default location
    };
  }

  private resetNewsForm() {
    this.newsForm = {
      title: '',
      content: '',
      summary: '',
      author: this.authService.getUserDisplayName(),
      publishedAt: new Date().toISOString().split('T')[0],
      isPublished: true,
      category: 'general'
    };
  }
}
