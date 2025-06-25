import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsService, News } from '../../services/user';

@Component({
  selector: 'app-hirek',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hirek.html',
  styleUrl: './hirek.scss'
})
export class Hirek implements OnInit {
  private newsService = inject(NewsService);
  
  isSubscribing = signal(false);
  newsletterEmail = signal('');
  allNews = signal<News[]>([]);
  featuredNews = signal<News | null>(null);
  regularNews = signal<News[]>([]);

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    const publishedNews = this.newsService.getPublishedNews();
    this.allNews.set(publishedNews);
    
    // Set featured news (latest news)
    const featured = publishedNews.length > 0 ? publishedNews[0] : null;
    this.featuredNews.set(featured);
    
    // Set regular news (remaining news)
    const regular = publishedNews.slice(1);
    this.regularNews.set(regular);
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
      default: return 'Hír';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'announcement': return '📢';
      case 'event': return '🎄';
      case 'ministry': return '🙏';
      case 'general': return '📰';
      default: return '📝';
    }
  }

  getNewsExcerpt(content: string, length: number = 150): string {
    if (content.length <= length) return content;
    return content.substring(0, length) + '...';
  }
}
