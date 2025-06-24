import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../../services/event';
import { AttendanceService } from '../../services/attendance';

@Component({
  selector: 'app-fooldal',
  imports: [CommonModule, RouterModule],
  templateUrl: './fooldal.html',
  styleUrl: './fooldal.scss'
})
export class Fooldal implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private attendanceService = inject(AttendanceService);
  
  // Signals for reactive state
  upcomingEvents = signal<Event[]>([]);
  nextSundayService = signal<Event | null>(null);
  countdownTimer = signal<string>('');
  isLive = signal<boolean>(false);
  
  private countdownInterval: any;

  ngOnInit(): void {
    this.loadUpcomingEvents();
    this.startCountdown();
    this.checkLiveStatus();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private loadUpcomingEvents(): void {
    // Get next 3 upcoming events for preview
    const upcoming = this.eventService.getUpcomingEvents().slice(0, 3);
    this.upcomingEvents.set(upcoming);
    
    // Get next Sunday service for countdown
    const nextService = this.eventService.getNextSundayService();
    this.nextSundayService.set(nextService || null);
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
    // Simple live check - in real app this would connect to YouTube API
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isServiceTime = now.getHours() >= 10 && now.getHours() < 12;
    
    this.isLive.set(isSunday && isServiceTime);
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

  getEventTypeIcon(type: string): string {
    switch (type) {
      case 'service': return '⛪';
      case 'meeting': return '👥';
      case 'special': return '🌟';
      default: return '📅';
    }
  }

  getAttendanceCount(eventId: string): number {
    return this.attendanceService.getAttendanceCount(eventId);
  }
}
