import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class Navigation {
  isMenuOpen = signal(false);
  authService = inject(AuthService);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
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
      default: return 'Tag';
    }
  }

  private closeMenu() {
    this.isMenuOpen.set(false);
  }
}
