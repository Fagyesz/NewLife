import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { LiveStreamService } from './live-stream';
import { AuthService } from './auth';

export interface TestModeStatus {
  testMode: boolean;
  activeChannel: string;
  channels?: {
    production: { id: string; handle: string; name: string };
    test: { id: string; handle: string; name: string };
  };
}

export interface WorkerHealth {
  status: string;
  timestamp: string;
  testMode: boolean;
  activeChannel: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestModeService {
  private http = inject(HttpClient);
  private liveStreamService = inject(LiveStreamService);
  private authService = inject(AuthService);
  
  // Worker URLs from environment
  private readonly TEST_MODE_URL = environment.liveStream.testModeUrl;
  private readonly HEALTH_URL = environment.liveStream.healthUrl;
  
  // Signals for reactive state
  testModeStatus = signal<TestModeStatus>({
    testMode: false,
    activeChannel: 'Unknown'
  });
  
  workerHealth = signal<WorkerHealth | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Derived signals for convenient access in templates/components
  /**
   * `true` when Cloudflare Worker is in test-mode.
   * Usage example (template):
   * <code>{{ testModeService.isTestMode() ? 'Aktív' : 'Inaktív' }}</code>
   */
  isTestMode = computed(() => this.testModeStatus().testMode);

  /**
   * Currently active YouTube channel (id or human-readable).
   */
  activeChannelSignal = computed(() => this.testModeStatus().activeChannel);

  constructor() {
    // Initial data fetch is now handled by the component that injects the service.
  }

  /**
   * Check current test mode status
   */
  checkStatus(): void {
    if (!this.TEST_MODE_URL) {
      console.warn('Test mode URL not configured');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    this.http.get<TestModeStatus>(this.TEST_MODE_URL).pipe(
      tap(status => {
        this.testModeStatus.set(status);
        if (this.authService.isDev()) {
          console.log('🧪 Test mode status:', status.testMode ? 'ENABLED' : 'DISABLED');
          console.log('📺 Active channel:', status.activeChannel);
        }
        // Refresh live status immediately after any change
        this.liveStreamService.checkLiveStatus();
      }),
      catchError(error => {
        console.error('Failed to check test mode status:', error);
        this.error.set('Failed to check test mode status');
        return of(null);
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe();
  }

  /**
   * Enable test mode
   */
  enableTestMode(): void {
    this.setTestMode(true);
  }

  /**
   * Disable test mode
   */
  disableTestMode(): void {
    this.setTestMode(false);
  }

  /**
   * Toggle test mode
   */
  toggleTestMode(): void {
    const currentStatus = this.testModeStatus();
    this.setTestMode(!currentStatus.testMode);
  }

  /**
   * Set test mode state
   */
  private setTestMode(enable: boolean): void {
    if (!this.TEST_MODE_URL) {
      console.error('Test mode URL not configured');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    const body = { enable };
    
    this.http.post<TestModeStatus>(this.TEST_MODE_URL, body).pipe(
      tap(response => {
        this.testModeStatus.set(response);
        if (this.authService.isDev()) {
          console.log('🧪 Test mode changed:', response.testMode ? 'ENABLED' : 'DISABLED');
          console.log('📺 Active channel:', response.activeChannel);
        }
        // Immediately refresh live status to reflect new channel
        this.liveStreamService.checkLiveStatus();
      }),
      catchError(error => {
        console.error('Failed to set test mode:', error);
        this.error.set(`Failed to ${enable ? 'enable' : 'disable'} test mode`);
        return of(null);
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe();
  }

  /**
   * Check worker health
   */
  checkHealth(): void {
    if (!this.HEALTH_URL) {
      console.warn('Health URL not configured');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<WorkerHealth>(this.HEALTH_URL).pipe(
      tap(health => {
        this.workerHealth.set(health);
        if (this.authService.isDev()) {
          console.log('❤️ Worker health:', health.status);
        }
      }),
      catchError(error => {
        console.error('Worker health check failed:', error);
        this.workerHealth.set(null);
        this.error.set('Worker health check failed');
        return of(null);
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe();
  }

  /**
   * Get current test mode state
   */
  isTestModeEnabled(): boolean {
    return this.testModeStatus().testMode;
  }

  /**
   * Get active channel name
   */
  getActiveChannel(): string {
    return this.testModeStatus().activeChannel;
  }

  /**
   * Get channels configuration
   */
  getChannels() {
    return this.testModeStatus().channels;
  }

  /**
   * Check if worker is healthy
   */
  isWorkerHealthy(): boolean {
    const health = this.workerHealth();
    return health?.status === 'healthy';
  }

  /**
   * Get last error message
   */
  getLastError(): string | null {
    return this.error();
  }

  /**
   * Clear error
   */
  clearError() {
    this.error.set(null);
  }
} 