import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, NavigationStart } from '@angular/router';
import { Navigation } from './shared/navigation/navigation';
import { FloatingButtonComponent } from './shared/components/floating-button';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, FloatingButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'Új Élet Baptista Gyülekezet';
  
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);

  ngOnInit() {
    // Scroll to top on navigation start AND end
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart || event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          // Immediate scroll on navigation start
          this.forceScrollToTop();
        } else if (event instanceof NavigationEnd) {
          // Ensure scroll to top after navigation completes
          this.forceScrollToTop();
          // Additional scroll after animations might complete
          setTimeout(() => this.forceScrollToTop(), 100);
          setTimeout(() => this.forceScrollToTop(), 300);
        }
      });
  }

  onRouteActivate() {
    // Called when a new route component is activated
    this.forceScrollToTop();
  }

  private forceScrollToTop() {
    // Temporarily disable smooth scrolling for instant scroll
    const html = document.documentElement;
    const originalBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    
    // Multiple methods to ensure scroll to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.viewportScroller.scrollToPosition([0, 0]);
    
    // Restore smooth scrolling
    setTimeout(() => {
      html.style.scrollBehavior = originalBehavior;
    }, 50);
  }
}
