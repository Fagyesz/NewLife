import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent  implements OnInit, OnDestroy {
  countdownInterval!: Subscription; // Initialize with '!'
  countdownEndTime!: Date; // Initialize with '!'
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  
  constructor() {} // No need to add anything in the constructor for this example

  ngOnInit() {
    this.calculateCountdownEndTime();
    this.countdownInterval = interval(1000).subscribe(() => {
      this.updateCountdown();
    });
  }

  calculateCountdownEndTime() {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7;

    // Calculate the end time for exclusion period (Sunday 10:00 to 13:00)
    this.countdownEndTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilSunday,
      13, 0, 0
    );
  }
  ngOnDestroy() {
    // Unsubscribe from the interval when the component is destroyed
    this.countdownInterval.unsubscribe();
  }

  updateCountdown() {
    const now = new Date();

    // Check if current time is within the exclusion period
    if (now.getDay() === 0 && now.getHours() >= 10 && now.getHours() < 13) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
    } else {
      const timeDifference = this.countdownEndTime.getTime() - now.getTime();

      if (timeDifference > 0) {
        this.days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((timeDifference % 60000) / 1000); // Calculate seconds
      } else {
        // Countdown has ended, reset values or take appropriate action
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
      }
    }
  }
}
