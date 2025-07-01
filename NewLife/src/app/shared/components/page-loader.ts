import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-loader',
  imports: [CommonModule],
  template: `
    <div class="page-loader" [class.visible]="isVisible">
      <div class="loader-content">
        <div class="logo-animation">
          <img 
            src="assets/img/logo/logo-animated-2.svg" 
            alt="Új Élet Baptista Gyülekezet" 
            class="loader-logo"
            (error)="onLogoError($event)">
        </div>
        <div class="loader-text">
          <h3>Új Élet Baptista Gyülekezet</h3>
          <p>{{ loadingText }}</p>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #399344 0%, #429aca 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      
      &.visible {
        opacity: 1;
        visibility: visible;
      }
    }
    
    .loader-content {
      text-align: center;
      color: white;
      max-width: 300px;
      padding: 2rem;
    }
    
    .logo-animation {
      margin-bottom: 1.5rem;
      
      .loader-logo {
        width: 120px;
        height: auto;
        filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.3));
      }
    }
    
    .loader-text {
      margin-bottom: 2rem;
      
      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.3rem;
        font-weight: 700;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
      }
      
      p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.9;
        color: #eac338;
        animation: fadeInOut 2s ease-in-out infinite;
      }
    }
    
    .progress-bar {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #eac338, #f7c510);
        border-radius: 2px;
        animation: progressAnimation 2s ease-in-out infinite;
      }
    }
    
    @keyframes fadeInOut {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    
    @keyframes progressAnimation {
      0% { 
        width: 0%; 
        transform: translateX(-100%);
      }
      50% { 
        width: 70%; 
        transform: translateX(0%);
      }
      100% { 
        width: 100%; 
        transform: translateX(0%);
      }
    }
    
    @media (max-width: 768px) {
      .loader-content {
        max-width: 250px;
        padding: 1.5rem;
      }
      
      .logo-animation .loader-logo {
        width: 90px;
      }
      
      .loader-text h3 {
        font-size: 1.1rem;
      }
      
      .loader-text p {
        font-size: 0.8rem;
      }
    }
  `]
})
export class PageLoaderComponent {
  @Input() isVisible: boolean = false;
  @Input() loadingText: string = 'Betöltés...';

  onLogoError(event: any) {
    console.log('Page loader logo failed to load, using fallback');
    // Fallback to static PNG
    event.target.src = 'assets/img/logo/csak-logo.png';
    event.target.onerror = null; // Prevent infinite loop
  }
} 