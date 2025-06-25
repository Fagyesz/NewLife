import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async signInWithGoogle() {
    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      await this.authService.signInWithGoogle();
      
      // Redirect will be handled by the auth service
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage.set(
        error?.message || 'Hiba történt a bejelentkezés során. Kérjük, próbálja újra!'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut() {
    try {
      this.isLoading.set(true);
      await this.authService.signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      this.errorMessage.set('Hiba történt a kijelentkezés során.');
    } finally {
      this.isLoading.set(false);
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
}
