import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, catchError, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export interface LiveStreamStatus {
  isLive: boolean;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  viewerCount?: number;
  startedAt?: Date;
  lastChecked: Date;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiveStreamService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  // Cloudflare Worker endpoints - configured in environment
  private readonly WORKER_URL = environment.liveStream.workerUrl;
  private readonly FALLBACK_URL = environment.liveStream.fallbackUrl;
  
  // Signals for reactive state
  liveStatus = signal<LiveStreamStatus>({
    isLive: false,
    lastChecked: new Date(),
    error: 'Not checked yet'
  });
  
  isLoading = signal(false);
  
  constructor() {
    this.startLiveStatusPolling();
  }

  private startLiveStatusPolling(): void {
    // Check every 30 seconds
    interval(30000).pipe(
      tap(() => this.checkLiveStatus()),
      catchError(error => {
        console.error('Live status polling error:', error);
        return of(null);
      })
    ).subscribe();
    
    // Initial check
    this.checkLiveStatus();
  }

  /**
   * Add a cache-busting query string to avoid Cloudflare / browser caching issues.
   */
  private withCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
  }

  checkLiveStatus(): void {
    this.isLoading.set(true);
    
    this.http.get<LiveStreamStatus>(this.withCacheBuster(this.WORKER_URL)).pipe(
      tap(status => {
        this.liveStatus.set({
          ...status,
          lastChecked: new Date(),
          startedAt: status.startedAt ? new Date(status.startedAt) : undefined
        });
        if (this.authService.isDev()) {
          console.log('🎥 Live status updated (primary):', status.isLive ? 'LIVE' : 'OFFLINE');
        }
      }),
      catchError(error => {
        console.warn('⚠️ Primary URL failed, trying fallback...', error.message);
        
        // Try fallback URL
        return this.http.get<LiveStreamStatus>(this.withCacheBuster(this.FALLBACK_URL)).pipe(
          tap(status => {
            this.liveStatus.set({
              ...status,
              lastChecked: new Date(),
              startedAt: status.startedAt ? new Date(status.startedAt) : undefined
            });
            if (this.authService.isDev()) {
              console.log('🎥 Live status updated (fallback):', status.isLive ? 'LIVE' : 'OFFLINE');
            }
          }),
          catchError(fallbackError => {
            if (this.authService.isDev()) {
              console.error('❌ Both primary and fallback URLs failed:', fallbackError);
            }
            this.liveStatus.set({
              isLive: false,
              lastChecked: new Date(),
              error: 'Failed to check live status'
            });
            return of(null);
          })
        );
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe();
  }

  // Public methods
  getCurrentStatus(): LiveStreamStatus {
    return this.liveStatus();
  }

  isCurrentlyLive(): boolean {
    return this.liveStatus().isLive;
  }

  getStreamTitle(): string {
    const status = this.liveStatus();
    return status.title || 'Új Élet Istentisztelet';
  }

  getViewerCount(): number {
    return this.liveStatus().viewerCount || 0;
  }

  getTimeSinceStart(): string | null {
    const status = this.liveStatus();
    if (!status.isLive || !status.startedAt) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - status.startedAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} perce kezdődött`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours} órája, ${minutes} perce kezdődött`;
    }
  }
} 