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

  // FAQ items displayed on the page
  faqList = [
    {
      q: 'Mikor tartjátok az istentiszteleteket?',
      a: 'Vasárnap reggelente 10:00 órakor. Szerda este 19:00-kor bibliaórát, péntek este 18:30-kor imaórát tartunk.'
    },
    {
      q: 'Szükséges előzetesen bejelentkezni?',
      a: 'Nem, egyszerűen jöjjön el! Szeretettel várjuk minden alkalomra a látogatókat.'
    },
    {
      q: 'Van parkolási lehetőség?',
      a: 'Igen, ingyenes parkolás elérhető az épület mellett és a környező utcákban.'
    },
    {
      q: 'Milyen öltözékben jöjjek?',
      a: 'Nincs szigorú dress code. Jöjjön kényelmesen, ahogy van!'
    },
    {
      q: 'Hozhatom a gyermekeimet?',
      a: 'Természetesen! Gyermekfelügyelet biztosított a vasárnapi istentiszteletek alatt.'
    },
    {
      q: 'Hogyan tudok keresztelkedni?',
      a: 'Vegye fel a kapcsolatot lelkipásztorunkkal, aki szívesen megbeszéli Önnel a részleteket.'
    }
  ];

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
