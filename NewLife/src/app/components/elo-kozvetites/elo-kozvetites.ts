import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-elo-kozvetites',
  imports: [CommonModule],
  templateUrl: './elo-kozvetites.html',
  styleUrl: './elo-kozvetites.scss'
})
export class EloKozvetites implements OnInit, OnDestroy {
  isStreamLive = false;
  private countdownInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
    
    // Initial update
    this.updateCountdown();
  }

  private updateCountdown() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Calculate next Sunday at 10:00 AM
    const now = new Date();
    const nextSunday = new Date();
    
    // Find next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7;
    if (daysUntilSunday === 0 && now.getHours() >= 10) {
      // If it's Sunday and past 10 AM, get next Sunday
      nextSunday.setDate(now.getDate() + 7);
    } else {
      nextSunday.setDate(now.getDate() + daysUntilSunday);
    }
    
    nextSunday.setHours(10, 0, 0, 0);
    
    const timeDiff = nextSunday.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      this.isStreamLive = true;
      return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Update DOM elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (daysElement) daysElement.textContent = days.toString();
    if (hoursElement) hoursElement.textContent = hours.toString();
    if (minutesElement) minutesElement.textContent = minutes.toString();
    if (secondsElement) secondsElement.textContent = seconds.toString();
  }
}
