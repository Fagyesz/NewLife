import { Directive, ElementRef, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { AnimationStateService } from '../../services/animation-state';

@Directive({
  selector: '[animateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animateOnScroll: string = 'fadeInUp';
  @Input() animationDelay: number = 0;
  @Input() animationDuration: number = 600;
  @Input() threshold: number = 0.1;
  @Input() rootMargin: string = '0px 0px -50px 0px';

  private elementRef = inject(ElementRef);
  private animationState = inject(AnimationStateService);
  private observer?: IntersectionObserver;
  private hasAnimated = signal(false);
  private elementId: string = '';

  ngOnInit() {
    // Create element ID and check if already animated
    this.elementId = this.animationState.createElementId(
      this.elementRef.nativeElement, 
      this.animateOnScroll
    );
    
    // Always reset element state first to prevent conflicts
    this.resetElement();
    
    if (this.animationState.isAnimated(this.elementId)) {
      this.setFinalState();
      return;
    }
    
    this.setupElement();
    // Delay to ensure page is fully loaded and rendered before checking visibility
    setTimeout(() => {
      this.createObserver();
    }, 200);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Clean up any running animations
    const element = this.elementRef.nativeElement;
    if (element) {
      element.style.animation = 'none';
      element.style.transition = 'none';
    }
  }

  private setupElement() {
    const element = this.elementRef.nativeElement;
    element.style.opacity = '0';
    element.style.transform = this.getInitialTransform();
    
    // Use different timing functions for different animation types
    if (this.animateOnScroll === 'bounceIn') {
      element.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    } else {
      element.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    }
    
    element.style.transitionDelay = `${this.animationDelay}ms`;
  }

  private getInitialTransform(): string {
    switch (this.animateOnScroll) {
      case 'fadeInUp':
        return 'translateY(30px)';
      case 'fadeInDown':
        return 'translateY(-30px)';
      case 'fadeInLeft':
        return 'translateX(-30px)';
      case 'fadeInRight':
        return 'translateX(30px)';
      case 'slideInLeft':
        return 'translateX(-50px)';
      case 'slideInRight':
        return 'translateX(50px)';
      case 'slideInUp':
        return 'translateY(50px)';
      case 'slideInDown':
        return 'translateY(-50px)';
      case 'zoomIn':
        return 'scale(0.9)';
      case 'zoomOut':
        return 'scale(1.1)';
      case 'rotateIn':
        return 'rotate(-10deg) scale(0.9)';
      case 'bounceIn':
        return 'scale(0.3)';
      default:
        return 'translateY(20px)';
    }
  }

  private createObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.animateElement();
      return;
    }

    // Check if element is already visible with a more generous viewport check
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const isInitiallyVisible = rect.top < viewportHeight * 0.9 && rect.bottom > 0;

    if (isInitiallyVisible) {
      // If initially visible, animate with a small delay to ensure page is ready
      setTimeout(() => {
        this.animateElement();
      }, this.animationDelay + 50);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated()) {
            this.animateElement();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
    
    // Fallback: if element is visible but still not animated after 1 second, animate it
    setTimeout(() => {
      if (!this.hasAnimated()) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const isCurrentlyVisible = rect.top < viewportHeight * 0.9 && rect.bottom > 0;
        
        if (isCurrentlyVisible) {
          this.animateElement();
        }
      }
    }, 1000);
  }

  private animateElement() {
    if (this.hasAnimated()) return;
    
    this.hasAnimated.set(true); // Mark as animated immediately
    this.animationState.markAsAnimated(this.elementId); // Mark globally
    const element = this.elementRef.nativeElement;
    
    // Clear any existing animations to prevent conflicts
    element.style.animation = 'none';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = this.getFinalTransform();
      
      // For bounceIn, use the bounce timing function
      if (this.animateOnScroll === 'bounceIn') {
        element.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        element.style.transitionDelay = `${this.animationDelay}ms`;
      }
      
      // Clean up transition after animation completes
      setTimeout(() => {
        element.style.transition = ''; // Clear inline styles to allow CSS rules
      }, this.animationDuration + this.animationDelay + 50);
    });
  }

  private getFinalTransform(): string {
    switch (this.animateOnScroll) {
      case 'rotateIn':
        return 'rotate(0deg) scale(1)';
      default:
        return 'translateX(0) translateY(0) scale(1)';
    }
  }



  private resetElement(): void {
    const element = this.elementRef.nativeElement;
    element.style.animation = 'none';
    element.style.transition = 'none';
    element.style.transform = '';
    element.style.opacity = '';
  }

  private setFinalState(): void {
    this.hasAnimated.set(true);
    const element = this.elementRef.nativeElement;
    element.style.opacity = '1';
    element.style.transform = this.getFinalTransform();
    element.style.animation = 'none';
    element.style.transition = ''; // Clear transition to allow CSS rules to take effect
  }
} 