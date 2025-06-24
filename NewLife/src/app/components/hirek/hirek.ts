import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hirek',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hirek.html',
  styleUrl: './hirek.scss'
})
export class Hirek {
  isSubscribing = signal(false);
  newsletterEmail = signal('');

  async subscribeToNewsletter() {
    const email = this.newsletterEmail();
    
    if (!email) {
      alert('Kérjük, adja meg email címét!');
      return;
    }

    if (!this.isValidEmail(email)) {
      alert('Kérjük, adjon meg egy érvényes email címet!');
      return;
    }

    try {
      this.isSubscribing.set(true);
      
      // In a real application, this would send the email to a server
      // For now, we'll just simulate the subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Köszönjük! Sikeresen feliratkozott hírlevelünkre.');
      this.newsletterEmail.set('');
      
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Hiba történt a feliratkozás során. Kérjük, próbálja újra később.');
    } finally {
      this.isSubscribing.set(false);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
