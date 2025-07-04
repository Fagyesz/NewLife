import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { getAnalytics, setAnalyticsCollectionEnabled, isSupported } from 'firebase/analytics';

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'analytics-consent';

  /**
   * stores 'granted' | 'denied' | null (not yet answered)
   */
  private consentStatus = signal<'granted' | 'denied' | null>(this.loadStoredStatus());

  /** shortcut: has user already made a choice? */
  isConsentSet(): boolean {
    return this.consentStatus() !== null;
  }

  /** true only when consent == 'granted' */
  hasAnalyticsConsent(): boolean {
    return this.consentStatus() === 'granted';
  }

  constructor() {
    // Apply collection state once we know status
    this.applyAnalyticsSetting(this.hasAnalyticsConsent());
  }

  /**
   * Persist the visitor's decision and enable/disable GA collection on the fly
   */
  setAnalyticsConsent(allowed: boolean): void {
    const status: 'granted' | 'denied' = allowed ? 'granted' : 'denied';
    this.consentStatus.set(status);
    this.saveStoredStatus(status);
    this.applyAnalyticsSetting(allowed);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------
  private loadStoredStatus(): 'granted' | 'denied' | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(this.storageKey);
    if (raw === 'granted' || raw === 'denied') return raw;
    return null;
  }

  private saveStoredStatus(value: 'granted' | 'denied'): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, value);
    }
  }

  private async applyAnalyticsSetting(enabled: boolean): Promise<void> {
    // Only apply in production & browser context
    if (!environment.production || !isPlatformBrowser(this.platformId)) return;

    try {
      // GA might not be supported on certain platforms (SSR, older browsers)
      if (!(await isSupported())) return;
      const analytics = getAnalytics();
      setAnalyticsCollectionEnabled(analytics, enabled);
    } catch (err) {
      console.warn('Analytics not initialised or not supported:', err);
    }
  }
} 