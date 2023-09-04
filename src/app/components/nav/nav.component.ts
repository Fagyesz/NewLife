import { Component,HostListener,OnDestroy, OnInit  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from "../../services/auth/auth.service";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavService } from "src/app/services/nav/nav.service";
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnDestroy, OnInit {
  loggedIn: boolean = false;
  isNavCollapsed = true;
  isDropdownOpen = false;
  public isLightTheme = true;
  isModalOpen: boolean = false;
  isScrolled = false;
  userId:string='null';
  isAdmin=false;
  isOrganizer=false;

  onThemeSwitchChange() {
    this.isLightTheme = !this.isLightTheme;

    document.body.setAttribute(
      'data-theme',
      this.isLightTheme ? 'light' : 'dark'
    );
  }
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleNavbar(): void {
    this.isNavCollapsed = !this.isNavCollapsed;
  }


  constructor(public authService: AuthService,private router: Router,private navService:NavService,public userdata:UserDataService) {
    if(this.authService.getUserUid()!==null){ this.userId=this.authService.getUserUid()!}
   
  }



  ngOnInit() { 
    this.loggedIn=this.authService.isLoggedIn;
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;
    });

    // Subscribe to the modalState$ observable to get updates on modal state changes
    this.navService.modalState$.subscribe((isOpen) => {
      this.isModalOpen = isOpen;
      console.log("modalstatus in nav "+this.isModalOpen)
    });
    const userUid = this.authService.getUserUid();
    if (userUid) {
      console.log('User UID:', userUid);
    } else {
      console.log('User not logged in.');
    }
    

    this.userdata.isAdmin(this.userId).subscribe((isAdmin) => {
      this.isAdmin=isAdmin;
    });
    this.userdata.isOrganizer(this.userId).subscribe((isOrganizer) => {
      this.isOrganizer=isOrganizer;
    });
  }
  ngOnDestroy(): void {
    
  }
  redirectToLoginPage() {
    this.router.navigate(['/login']); // Replace 'login' with your actual login page route
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Check the scroll position and update the isScrolled property
    this.isScrolled = window.scrollY > 0;
    console.log("scrolled")
  }
}
