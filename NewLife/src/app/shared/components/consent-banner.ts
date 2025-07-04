import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsentService } from '../../services/consent';

@Component({
  selector: 'app-consent-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!consentService.isConsentSet()" class="consent-banner show">
      <div class="banner-content">
        <span class="emoji">🍪</span>
        <p class="message">
          Ez a weboldal anonim analitikai sütiket használ a jobb felhasználói élmény érdekében.
        </p>
      </div>
      <div class="actions">
        <button class="btn accept" (click)="accept()">Elfogadom</button>
        <button class="btn decline" (click)="decline()">Elutasítom</button>
      </div>
    </div>
  `,
  styles: [`
    .consent-banner {
      position: fixed;
      bottom: 1.25rem;
      left: 1.25rem;
      width: 320px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 8px 18px rgba(0,0,0,0.1);
      font-size: 0.9rem;
      color: #333;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s ease;
      z-index: 1050;
    }

    .consent-banner.show {
      opacity: 1;
      transform: translateY(0);
    }

    .banner-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .emoji {
      font-size: 1.5rem;
    }

    .message {
      margin: 0;
      line-height: 1.4;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .btn {
      flex: 1 1 auto;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.25s ease;
    }

    .btn.accept {
      background: linear-gradient(135deg, #399344 0%, #429aca 100%);
      color: #fff;
    }

    .btn.accept:hover {
      background: linear-gradient(135deg, #2e7a38 0%, #3883b0 100%);
    }

    .btn.decline {
      background: #e0e0e0;
      color: #333;
    }

    .btn.decline:hover {
      background: #d5d5d5;
    }

    @media (max-width: 480px) {
      .consent-banner {
        width: calc(100% - 2rem);
        left: 1rem;
        right: 1rem;
      }
    }
  `]
})
export class ConsentBanner {
  consentService = inject(ConsentService);

  accept() {
    this.consentService.setAnalyticsConsent(true);
  }

  decline() {
    this.consentService.setAnalyticsConsent(false);
  }
} 