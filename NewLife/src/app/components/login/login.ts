import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  /**
   * Tracks whether the visitor has accepted the technical cookies that are
   * required for signing in. The initial value is loaded from localStorage so
   * the user only needs to accept once.
   */
  loginCookieAccepted = signal(this.loadStoredCookieAcceptance());

  /** LocalStorage key where we remember the visitor's decision */
  private readonly cookieStorageKey = 'login-cookie-accepted';

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // In SSR the constructor runs on the server where localStorage is undefined.
    // When the component hydrates in the browser, re-sync the value from
    // localStorage so the checkbox state is correct.
    if (isPlatformBrowser(this.platformId)) {
      const stored = this.loadStoredCookieAcceptance();
      if (stored !== this.loginCookieAccepted()) {
        this.loginCookieAccepted.set(stored);
      }
    }
  }

  async signInWithGoogle() {
    if (!this.loginCookieAccepted()) {
      this.errorMessage.set('Kérjük fogadja el a bejelentkezéshez szükséges sütiket.');
      return;
    }

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      await this.authService.signInWithGoogle();
      
      // If sign-in succeeds we can assume the visitor accepts the required
      // technical cookies. Persist that so the checkbox is pre-checked next
      // time they open the page.
      this.loginCookieAccepted.set(true);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.cookieStorageKey, 'true');
      }

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

  /**
   * Persists the checkbox state so returning visitors don't have to accept it
   * again. Runs only in the browser.
   */
  toggleCookieAccepted(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.loginCookieAccepted.set(checked);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.cookieStorageKey, String(checked));
    }
  }

  /** Reads the saved consent value (if any) from localStorage. */
  private loadStoredCookieAcceptance(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(this.cookieStorageKey) === 'true';
  }

  /**
   * Handles image errors for the user avatar shown after signing in.
   * Falls back to a local icon to avoid broken images.
   */
  onImgError(event: Event) {
    const imgEl = (event as any).target as HTMLImageElement;
    imgEl.onerror = null; // prevent infinite loop
    imgEl.src = '/icons/icon-128x128-v2.png';
  }
}
