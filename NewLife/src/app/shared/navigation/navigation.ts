import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class Navigation {
  isMenuOpen = signal(false);
  authService = inject(AuthService);
  private viewportScroller = inject(ViewportScroller);
  logoError = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  onNavigate() {
    this.closeMenu();
    this.forceScrollToTop();
  }

  private forceScrollToTop() {
    // Temporarily disable smooth scrolling for instant scroll
    const html = document.documentElement;
    const originalBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    
    // Multiple methods to ensure scroll to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.viewportScroller.scrollToPosition([0, 0]);
    
    // Restore smooth scrolling
    setTimeout(() => {
      html.style.scrollBehavior = originalBehavior;
    }, 50);
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.closeMenu();
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Kijelentkezési hiba: ' + (error as Error).message);
    }
  }

  getUserRoleText(): string {
    const role = this.authService.userProfile()?.role;
    switch (role) {
      case 'admin': return 'Adminisztrátor';
      case 'staff': return 'Személyzet';
      case 'dev': return 'Fejlesztő';
      case 'member': return 'Tag';
      case 'guest': return 'Vendég';
      default: return 'Tag';
    }
  }

  private closeMenu() {
    this.isMenuOpen.set(false);
  }

  onLogoError(event: any) {
    console.log('Logo failed to load, using fallback');
    this.logoError.set(true);
    // Set fallback image
    event.target.src = 'assets/img/logo/csak-logo.png';
    event.target.onerror = null; // Prevent infinite loop
  }
}
