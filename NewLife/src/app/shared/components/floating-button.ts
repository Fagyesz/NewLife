import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-floating-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="floating-button" [class.expanded]="isExpanded()" (click)="toggleExpanded($event)">
      <div class="main-button">
        <span class="icon">{{ mainIcon }}</span>
      </div>
      
      <div class="actions" *ngIf="isExpanded()">
        <a *ngFor="let action of actions; let i = index" 
           [routerLink]="action.link" 
           [href]="action.href"
           [target]="action.target"
           class="action-button"
           [style.animation-delay]="(i * 100) + 'ms'"
           [title]="action.label"
           (click)="handleActionClick($event)">
          <span class="action-icon">{{ action.icon }}</span>
          <span class="action-label">{{ action.label }}</span>
        </a>
      </div>
      
      <div class="backdrop" *ngIf="isExpanded()" (click)="closeExpanded($event)" (mousedown)="$event.preventDefault()"></div>
    </div>
  `,
  styles: [`
    .floating-button {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      pointer-events: none;
    }
    
    .floating-button * {
      pointer-events: auto;
    }
    
    .main-button {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #399344 0%, #429aca 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(57, 147, 68, 0.4);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      position: relative;
      z-index: 1003;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 35px rgba(57, 147, 68, 0.5);
        animation: pulse 1.5s infinite;
      }
      
      .icon {
        font-size: 1.5rem;
        color: white;
        transition: transform 0.3s ease;
      }
    }
    
    .floating-button.expanded .main-button {
      background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
      
      .icon {
        transform: rotate(45deg);
      }
    }
    
    .actions {
      position: absolute;
      bottom: 80px;
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 1002;
    }
    
    .action-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem 1rem;
      border-radius: 25px;
      text-decoration: none;
      color: #333;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      animation: slideInRight 0.4s ease-out forwards;
      opacity: 0;
      transform: translateX(20px);
      white-space: nowrap;
      position: relative;
      z-index: 1004;
      pointer-events: auto;
      
      &:hover {
        transform: translateX(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        background: #f8f9fa;
      }
      
      .action-icon {
        font-size: 1.25rem;
        min-width: 20px;
      }
      
      .action-label {
        font-weight: 500;
        font-size: 0.9rem;
      }
    }
    
    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.2);
      z-index: 999;
      animation: fadeIn 0.3s ease;
      pointer-events: auto;
    }
    
    @keyframes slideInRight {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1.1);
      }
      50% {
        transform: scale(1.15);
      }
    }
    
    @media (max-width: 768px) {
      .floating-button {
        bottom: 1.5rem;
        right: 1.5rem;
      }
      
      .main-button {
        width: 64px;
        height: 64px;
        box-shadow: 0 10px 30px rgba(57, 147, 68, 0.5);
        
        .icon {
          font-size: 1.5rem;
        }
        
        &:hover {
          box-shadow: 0 15px 40px rgba(57, 147, 68, 0.6);
        }
      }
      
      .actions {
        bottom: 90px;
      }
      
      .action-button {
        padding: 0.75rem 1rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        
        .action-icon {
          font-size: 1.25rem;
        }
        
        .action-label {
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        &:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        }
      }
    }
  `]
})
export class FloatingButtonComponent {
  private router = inject(Router);
  
  @Input() mainIcon = '📱';
  @Input() actions: Array<{
    icon: string;
    label: string;
    link?: string;
    href?: string;
    target?: string;
  }> = [
    { icon: '🏠', label: 'Főoldal', link: '/' },
    { icon: '👥', label: 'Rólunk', link: '/rolunk' },
    { icon: '📅', label: 'Események', link: '/esemenyek' },
    { icon: '🔴', label: 'Élő közvetítés', link: '/elo-kozvetites' },
    { icon: '📰', label: 'Hírek', link: '/hirek' },
    { icon: '📞', label: 'Kapcsolat', link: '/kapcsolat' },
    { icon: '💬', label: 'Discord', href: 'https://discord.gg/gTDUpApNae', target: '_blank' }
  ];

  isExpanded = signal(false);

  constructor() {
    // Listen to router navigation events to close menu
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isExpanded.set(false);
    });
  }

  toggleExpanded(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isExpanded.set(!this.isExpanded());
  }

  closeExpanded(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isExpanded.set(false);
  }

  handleActionClick(event: Event) {
    // For external links (like Discord), close menu immediately
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href && link.target === '_blank') {
      // External link - close immediately
      this.closeExpanded();
    } else {
      // Internal navigation - the router events will handle closing
      // Just stop propagation to prevent backdrop from interfering
      event.stopPropagation();
    }
  }
} 