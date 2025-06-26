import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnimationStateService {
  private router = inject(Router);
  private animatedElements = new Set<string>();
  private currentPath = '';

  constructor() {
    // Clear animation state on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // If navigating to a different page, clear animation state
      if (this.currentPath && this.currentPath !== event.url) {
        this.clearAnimationState();
      }
      this.currentPath = event.url;
    });
  }

  isAnimated(elementId: string): boolean {
    return this.animatedElements.has(elementId);
  }

  markAsAnimated(elementId: string): void {
    this.animatedElements.add(elementId);
  }

  clearAnimationState(): void {
    this.animatedElements.clear();
  }

  pauseAllAnimations(): void {
    document.body.classList.add('animation-paused');
  }

  resumeAllAnimations(): void {
    document.body.classList.remove('animation-paused');
  }

  disableAnimations(): void {
    document.body.classList.add('animation-disabled');
  }

  enableAnimations(): void {
    document.body.classList.remove('animation-disabled');
  }

  createElementId(element: HTMLElement, animationType: string): string {
    // Create a unique, stable ID based on element content and page location
    const path = window.location.pathname;
    const text = element.textContent?.trim().slice(0, 20) || '';
    const tagName = element.tagName.toLowerCase();
    
    // Find element's position in its parent to make it more unique
    const parent = element.parentElement;
    let siblingIndex = 0;
    if (parent) {
      const siblings = Array.from(parent.children);
      siblingIndex = siblings.indexOf(element);
    }
    
    return `${path}_${tagName}_${animationType}_${siblingIndex}_${text.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
} 