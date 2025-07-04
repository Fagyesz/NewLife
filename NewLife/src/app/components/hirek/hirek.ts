import { Component, signal, inject, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsService, News } from '../../services/user';
import { BubblesComponent } from '../../shared/bubbles/bubbles';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { ReverseNamePipe } from '../../shared/pipes/reverse-name.pipe';

@Component({
  selector: 'app-hirek',
  imports: [CommonModule, FormsModule, RouterModule, BubblesComponent, AnimateOnScrollDirective, ReverseNamePipe],
  templateUrl: './hirek.html',
  styleUrl: './hirek.scss'
})
export class Hirek implements OnInit {
  private newsService = inject(NewsService);
  private platformId = inject(PLATFORM_ID);
  
  isSubscribing = signal(false);
  newsletterEmail = signal('');

  // Reactive news signals that automatically update when NewsService data changes
  allNews = computed(() => this.newsService.getPublishedNews());

  featuredNews = computed(() => {
    const news = this.allNews();
    return news.length > 0 ? news[0] : null;
  });

  regularNews = computed(() => this.allNews().slice(1));

  selectedNews = signal<News | null>(null);
  showNewsModal = signal(false);

  ngOnInit(): void {
    /* Intentionally left blank */
  }

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

  formatNewsDate(date: Date): string {
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getCategoryText(category: string): string {
    switch (category) {
      case 'announcement': return 'Közlemény';
      case 'event': return 'Esemény';
      case 'ministry': return 'Szolgálat';
      case 'general': return 'Általános';
      case 'pastoral': return 'Lelkészi üzenet';
      case 'prayer_request': return 'Imakérés';
      case 'testimony': return 'Bizonyságtétel';
      case 'bible_study': return 'Bibliaóra';
      case 'youth': return 'Ifjúsági';
      case 'children': return 'Gyermek';
      case 'missions': return 'Misszió';
      case 'volunteer': return 'Önkéntes munka';
      case 'community': return 'Közösség';
      case 'celebration': return 'Ünneplés';
      default: return 'Hír';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'announcement': return '📢';
      case 'event': return '🎄';
      case 'ministry': return '🙏';
      case 'general': return '📰';
      case 'pastoral': return '✝️';
      case 'prayer_request': return '🙏';
      case 'testimony': return '💬';
      case 'bible_study': return '📖';
      case 'youth': return '👨‍👩‍👧‍👦';
      case 'children': return '👶';
      case 'missions': return '🌍';
      case 'volunteer': return '🤝';
      case 'community': return '👥';
      case 'celebration': return '🎉';
      default: return '📝';
    }
  }

  getNewsExcerpt(content: string, length: number = 150): string {
    if (!content) {
      return '';
    }

    if (isPlatformBrowser(this.platformId)) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    } else {
      // Basic fallback for SSR
      const plainText = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
      if (plainText.length <= length) return plainText;
      return plainText.substring(0, length) + '...';
    }
  }

  openNewsModal(newsItem: News): void {
    this.selectedNews.set(newsItem);
    this.showNewsModal.set(true);
  }

  closeNewsModal(): void {
    this.showNewsModal.set(false);
    this.selectedNews.set(null);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
    }
  }
}
