import { Directive, ElementRef, Input, OnInit, inject, signal } from '@angular/core';
import { PerformanceService } from '../../services/performance';

@Directive({
  selector: '[lazyImg]',
  standalone: true
})
export class LazyImgDirective implements OnInit {
  @Input() set lazyImg(src: string) {
    this.imageSrc.set(src);
  }
  
  @Input() placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
  
  private elementRef = inject(ElementRef);
  private performanceService = inject(PerformanceService);
  private imageSrc = signal<string>('');
  private observer?: IntersectionObserver;

  ngOnInit() {
    this.setPlaceholder();
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setPlaceholder() {
    this.elementRef.nativeElement.src = this.placeholder;
  }

  private createObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private loadImage() {
    const img = new Image();
    img.onload = () => {
      this.elementRef.nativeElement.src = this.imageSrc();
      this.elementRef.nativeElement.classList.add('loaded');
      this.performanceService.trackImageLazyLoad();
    };
    img.onerror = () => {
      this.elementRef.nativeElement.src = this.placeholder;
      this.elementRef.nativeElement.classList.add('error');
    };
    img.src = this.imageSrc();
  }
} 