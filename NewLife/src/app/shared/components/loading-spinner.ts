import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="loading-content">
        <div class="logo-container">
          <img 
            [src]="logoSrc" 
            alt="Új Élet Baptista Gyülekezet" 
            class="loading-logo"
            (error)="onLogoError($event)">
        </div>
        @if (message) {
          <p class="loading-message">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      min-height: 120px;
      
      &.overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(2px);
        z-index: 9999;
      }
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .loading-logo {
      width: 80px;
      height: auto;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
    }
    
    .loading-message {
      color: #399344;
      font-weight: 500;
      font-size: 0.9rem;
      text-align: center;
      margin: 0;
      animation: fadeInOut 2s ease-in-out infinite;
    }
    
    @keyframes fadeInOut {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    
    // Responsive sizing
    @media (max-width: 768px) {
      .loading-logo {
        width: 60px;
      }
      
      .loading-message {
        font-size: 0.8rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() overlay: boolean = false;
  @Input() animationType: 'pulse' | 'sway' | 'static' = 'pulse';

  get logoSrc(): string {
    switch (this.animationType) {
      case 'pulse':
        return 'assets/img/logo/logo-animated-1.svg';
      case 'sway':
        return 'assets/img/logo/logo-animated-2.svg';
      case 'static':
      default:
        return 'assets/img/logo/logo.svg';
    }
  }

  onLogoError(event: any) {
    console.log('Animated logo failed to load, using fallback');
    // Fallback to static PNG
    event.target.src = 'assets/img/logo/csak-logo.png';
    event.target.onerror = null; // Prevent infinite loop
  }
} 