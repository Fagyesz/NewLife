import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BubblesComponent } from '../../shared/bubbles/bubbles';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-kapcsolat',
  imports: [CommonModule, FormsModule, RouterModule, BubblesComponent, AnimateOnScrollDirective],
  templateUrl: './kapcsolat.html',
  styleUrl: './kapcsolat.scss'
})
export class Kapcsolat {
  isSending = signal(false);
  
  // Form data
  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  async sendMessage() {
    if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
      alert('Kérjük, töltse ki az összes kötelező mezőt!');
      return;
    }

    try {
      this.isSending.set(true);
      
      // In a real application, this would send the form data to a server
      // For now, we'll just simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Köszönjük üzenetét! Hamarosan válaszolunk.');
      this.resetForm();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.');
    } finally {
      this.isSending.set(false);
    }
  }

  private resetForm() {
    this.contactData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
