import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationStateService {
  private animatedElements = new Set<string>();

  isAnimated(elementId: string): boolean {
    return this.animatedElements.has(elementId);
  }

  markAsAnimated(elementId: string): void {
    this.animatedElements.add(elementId);
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