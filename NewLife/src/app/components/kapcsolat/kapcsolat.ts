import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-kapcsolat',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './kapcsolat.html',
  styleUrl: './kapcsolat.scss'
})
export class Kapcsolat {
  isSubmitting = signal(false);
  
  // Form data
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  async onSubmit() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      alert('Kérjük, töltse ki az összes kötelező mezőt!');
      return;
    }

    try {
      this.isSubmitting.set(true);
      
      // In a real application, this would send the form data to a server
      // For now, we'll just simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Köszönjük üzenetét! Hamarosan válaszolunk.');
      this.resetForm();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
