import { Injectable, signal } from '@angular/core';

export interface PerformanceMetrics {
  loadTime: number;
  routeChangeTime: number;
  imageLazyLoadCount: number;
  serviceWorkerCacheHits: number;
  bundleSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics = signal<PerformanceMetrics>({
    loadTime: 0,
    routeChangeTime: 0,
    imageLazyLoadCount: 0,
    serviceWorkerCacheHits: 0,
    bundleSize: 0
  });

  constructor() {
    this.measureInitialLoadTime();
    this.setupPerformanceObserver();
  }

  getMetrics() {
    return this.metrics();
  }

  private measureInitialLoadTime() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.updateMetric('loadTime', loadTime);
      });
    }
  }

  private setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.updateMetric('loadTime', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  trackImageLazyLoad() {
    this.updateMetric('imageLazyLoadCount', this.metrics().imageLazyLoadCount + 1);
  }

  trackRouteChange(startTime: number) {
    const endTime = performance.now();
    this.updateMetric('routeChangeTime', endTime - startTime);
  }

  trackServiceWorkerCacheHit() {
    this.updateMetric('serviceWorkerCacheHits', this.metrics().serviceWorkerCacheHits + 1);
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number) {
    this.metrics.update(current => ({
      ...current,
      [key]: value
    }));
  }

  getPerformanceReport(): string {
    const metrics = this.metrics();
    return `
Performance Report:
- Load Time: ${metrics.loadTime.toFixed(2)}ms
- Route Change Time: ${metrics.routeChangeTime.toFixed(2)}ms
- Images Lazy Loaded: ${metrics.imageLazyLoadCount}
- SW Cache Hits: ${metrics.serviceWorkerCacheHits}
    `.trim();
  }

  // Log performance metrics to console (development only)
  logMetrics() {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('📊 Performance Metrics:', this.metrics());
    }
  }
} 