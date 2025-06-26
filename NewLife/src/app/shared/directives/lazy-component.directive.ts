import { Directive, ViewContainerRef, Input, OnInit, inject, signal } from '@angular/core';

@Directive({
  selector: '[lazyComponent]',
  standalone: true
})
export class LazyComponentDirective implements OnInit {
  @Input() set lazyComponent(componentLoader: () => Promise<any>) {
    this.componentLoader.set(componentLoader);
  }
  
  private viewContainer = inject(ViewContainerRef);
  private componentLoader = signal<(() => Promise<any>) | null>(null);
  private observer?: IntersectionObserver;
  private isLoaded = signal(false);

  ngOnInit() {
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.loadComponent();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isLoaded()) {
            this.loadComponent();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px 0px',
        threshold: 0.1
      }
    );

    this.observer.observe(this.viewContainer.element.nativeElement.parentElement);
  }

  private async loadComponent() {
    if (this.isLoaded() || !this.componentLoader()) {
      return;
    }

    try {
      const loader = this.componentLoader()!;
      const componentType = await loader();
      this.viewContainer.createComponent(componentType);
      this.isLoaded.set(true);
    } catch (error) {
      console.error('Failed to load component:', error);
    }
  }
} 