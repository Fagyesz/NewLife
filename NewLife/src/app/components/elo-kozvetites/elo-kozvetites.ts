import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal, inject, effect } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BubblesComponent } from '../../shared/bubbles/bubbles';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { LiveStreamService } from '../../services/live-stream';
import { TestModeService } from '../../services/test-mode';

@Component({
  selector: 'app-elo-kozvetites',
  imports: [CommonModule, BubblesComponent, AnimateOnScrollDirective],
  templateUrl: './elo-kozvetites.html',
  styleUrl: './elo-kozvetites.scss'
})
export class EloKozvetites implements OnInit, OnDestroy {
  private liveStreamService = inject(LiveStreamService);
  private testModeService = inject(TestModeService);
  
  // Signals for reactive state - now using the live stream service
  isStreamLive = signal(false);
  countdownText = signal('');
  timeUntilService = signal({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Stream info from service
  streamTitle = signal('');
  viewerCount = signal(0);
  timeSinceStart = signal<string | null>(null);
  lastChecked = signal<Date>(new Date());
  
  // YouTube stream configuration
  youtubeChannelId = 'UC3GbgMOUrfVnipHXvXQYFkA'; // Default: Új Élet Baptista Gyülekezet
  youtubeEmbedUrl = signal<SafeResourceUrl | null>(null);
  // Human-readable handle of current channel (starts with "@")
  youtubeChannelHandle = signal<string>('@ujeletbaptistagyulekezet');
  // Public channel page URL that points directly to the live tab
  youtubeChannelUrl = signal<string>('https://www.youtube.com/@ujeletbaptistagyulekezet/live');
  
  private countdownInterval: any;
  private statusUpdateInterval: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer
  ) {
    // Initial placeholder URL
    this.youtubeEmbedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(''));

    // React to test mode changes
    effect(() => {
      const status = this.testModeService.testModeStatus();
      const channels = this.testModeService.getChannels();
      
      if (status.testMode && channels?.test.id) {
        this.youtubeChannelId = channels.test.id;
        if (channels.test.handle) {
          this.youtubeChannelHandle.set(channels.test.handle.startsWith('@') ? channels.test.handle : '@' + channels.test.handle);
        }
      } else if (channels?.production.id) {
        this.youtubeChannelId = channels.production.id;
        if (channels.production.handle) {
          this.youtubeChannelHandle.set(channels.production.handle.startsWith('@') ? channels.production.handle : '@' + channels.production.handle);
        }
      }
      // Update derived URLs after channel information changes
      this.youtubeChannelUrl.set(`https://www.youtube.com/${this.youtubeChannelHandle()}/live`);
      
      this.updateEmbedUrl();
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.testModeService.checkStatus();
      
      this.startLiveStatusMonitoring();
      this.startCountdown();
      
      // For testing - expose component to global scope
      (window as any).liveStreamComponent = this;
      console.log('🎥 Live Stream component loaded. Test with: liveStreamComponent.simulateLiveMode()');
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }
  }

  private updateEmbedUrl(): void {
    const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${this.youtubeChannelId}`;
    this.youtubeEmbedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    console.log(`Live stream URL updated for channel: ${this.youtubeChannelId}`);
  }

  private startLiveStatusMonitoring(): void {
    // Update local state every second based on service data
    this.statusUpdateInterval = setInterval(() => {
      this.updateFromLiveService();
    }, 1000);
    
    // Initial update
    this.updateFromLiveService();
  }

  private updateFromLiveService(): void {
    const status = this.liveStreamService.getCurrentStatus();
    
    this.isStreamLive.set(status.isLive);
    this.streamTitle.set(this.liveStreamService.getStreamTitle());
    this.viewerCount.set(this.liveStreamService.getViewerCount());
    this.timeSinceStart.set(this.liveStreamService.getTimeSinceStart());
    this.lastChecked.set(status.lastChecked);
    
    // Update countdown text based on live status
    if (status.isLive) {
      const timeInfo = this.liveStreamService.getTimeSinceStart();
      this.countdownText.set(timeInfo || 'Istentisztelet folyamatban - Élő közvetítés!');
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

    // If we're currently live (based on actual service check), don't show countdown
    if (this.isStreamLive()) {
      return;
    }

    // Calculate next service time
    const now = new Date();
    const nextSunday = this.getNextSundayService();
    const timeDiff = nextSunday.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      // Calculate the next Sunday after this one
      const nextNextSunday = new Date(nextSunday);
      nextNextSunday.setDate(nextNextSunday.getDate() + 7);
      const nextTimeDiff = nextNextSunday.getTime() - now.getTime();
      
      const days = Math.floor(nextTimeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((nextTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((nextTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((nextTimeDiff % (1000 * 60)) / 1000);
      
      this.timeUntilService.set({ days, hours, minutes, seconds });
      this.updateCountdownText(days, hours, minutes, seconds);
      this.updateCountdownDisplay(days, hours, minutes, seconds);
      return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Update time signals
    this.timeUntilService.set({ days, hours, minutes, seconds });
    this.updateCountdownText(days, hours, minutes, seconds);
    this.updateCountdownDisplay(days, hours, minutes, seconds);
  }

  private updateCountdownText(days: number, hours: number, minutes: number, seconds: number) {
    if (days > 0) {
      this.countdownText.set(`${days} nap, ${hours} óra`);
    } else if (hours > 0) {
      this.countdownText.set(`${hours} óra, ${minutes} perc`);
    } else {
      this.countdownText.set(`${minutes} perc, ${seconds} másodperc`);
    }
  }

  private getNextSundayService(): Date {
    const now = new Date();
    const nextSunday = new Date();
    
    // If it's Sunday but after service time, get next Sunday
    if (now.getDay() === 0 && now.getHours() >= 12) {
      nextSunday.setDate(now.getDate() + 7);
    } else {
      // Calculate days until next Sunday
      const daysUntilSunday = (7 - now.getDay()) % 7;
      if (daysUntilSunday === 0) {
        // It's Sunday but before service time
        nextSunday.setDate(now.getDate());
      } else {
        nextSunday.setDate(now.getDate() + daysUntilSunday);
      }
    }
    
    // Set to 10:00 AM
    nextSunday.setHours(10, 0, 0, 0);
    return nextSunday;
  }

  private updateCountdownDisplay(days: number, hours: number, minutes: number, seconds: number) {
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
  }

  // Helper methods for template
  getStreamStatus(): string {
    if (this.isStreamLive()) {
      const viewers = this.viewerCount();
      const timeInfo = this.timeSinceStart();
      let status = 'Élő közvetítés folyamatban';
      if (viewers > 0) {
        status += ` • ${viewers} néző`;
      }
      if (timeInfo) {
        status += ` • ${timeInfo}`;
      }
      return status;
    }
    
    const status = this.liveStreamService.getCurrentStatus();
    if (status.error) {
      return 'Élő közvetítés állapota ellenőrizve: ' + new Date(status.lastChecked).toLocaleTimeString('hu-HU');
    }
    
    return 'Jelenleg nincs élő közvetítés';
  }

  getStreamStatusClass(): string {
    return this.isStreamLive() ? 'online' : 'offline';
  }

  getNextStreamText(): string {
    if (this.isStreamLive()) {
      return this.streamTitle() || 'Istentisztelet folyamatban';
    }
    return 'Következő közvetítés: Vasárnap 10:00';
  }

  getStreamTitle(): string {
    return this.streamTitle() || 'Új Élet Istentisztelet';
  }

  getViewerCount(): number {
    return this.viewerCount();
  }

  getLastCheckedText(): string {
    const lastChecked = this.lastChecked();
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} másodperce ellenőrizve`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} perce ellenőrizve`;
    } else {
      return lastChecked.toLocaleTimeString('hu-HU') + '-kor ellenőrizve';
    }
  }

  refreshStatus() {
    this.liveStreamService.checkLiveStatus();
  }

  // Test method - you can call this from browser console to test live mode
  simulateLiveMode(): void {
    console.log('🔴 Simulating live mode for testing...');
    this.isStreamLive.set(true);
    this.countdownText.set('TESZT - Istentisztelet folyamatban');
  }

  // Test method - reset to normal mode
  resetToNormalMode(): void {
    console.log('⚪ Resetting to normal countdown mode...');
    this.isStreamLive.set(false);
    this.updateCountdown();
  }
}
