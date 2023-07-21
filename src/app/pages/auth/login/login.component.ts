import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  remember: boolean = false;
  placeholderPassword: string = '1';
  passwordType: string = 'password';

  setLang() {
    switch (environment.DefaultLang) {
      case 'hu':
        this.placeholderPassword = 'Jelszó';
        break;
      case 'en':
        this.placeholderPassword = 'Password';
        break;

      default:
        break;
    }
  }
  togglePassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }

  constructor(public authService: AuthService) {}
  ngOnInit() {
    this.setLang();
  }
}
