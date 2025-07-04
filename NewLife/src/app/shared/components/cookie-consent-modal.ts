import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsentService } from '../../services/consent';

@Component({
  selector: 'app-cookie-consent-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-backdrop" (click)="close()"></div>
    <div class="cc-modal" (click)="$event.stopPropagation()">
      <h3>Sütik engedélyezése szükséges</h3>
      <p>A részvétel jelzéséhez fogadja el az analitikai sütik használatát.</p>
      <div class="cc-actions">
        <button class="btn btn-primary" (click)="accept()">Elfogadom</button>
        <button class="btn btn-secondary" (click)="close()">Bezárás</button>
      </div>
    </div>
  `,
  styles: [`
    .cc-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1050;
    }
    .cc-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 1.5rem;
      border-radius: 8px;
      max-width: 90%;
      width: 400px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1051;
      text-align: center;
    }
    .cc-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }
  `]
})
export class CookieConsentModal {
  private consentService = inject(ConsentService);

  @Output() accepted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  accept() {
    this.consentService.setAnalyticsConsent(true);
    this.accepted.emit();
  }

  close() {
    this.closed.emit();
  }
} 