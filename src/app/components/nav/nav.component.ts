import { Component,OnDestroy, OnInit  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnDestroy, OnInit {
  loggedIn: boolean = false;
  isNavCollapsed = true;
  public isLightTheme = true;
  
  onThemeSwitchChange() {
    this.isLightTheme = !this.isLightTheme;

    document.body.setAttribute(
      'data-theme',
      this.isLightTheme ? 'light' : 'dark'
    );
  }
  toggleNavbar(): void {
    this.isNavCollapsed = !this.isNavCollapsed;
  }


  constructor(public authService: AuthService,private router: Router) {
 
  }

  ngOnInit() { 
    this.loggedIn=this.authService.isLoggedIn;
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;
    });
  }
  ngOnDestroy(): void {
    
  }
  redirectToLoginPage() {
    this.router.navigate(['/login']); // Replace 'login' with your actual login page route
  }
}
