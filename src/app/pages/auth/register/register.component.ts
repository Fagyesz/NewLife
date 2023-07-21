import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from 'src/environment/environment';
import { IPasswordStrengthMeterService } from 'angular-password-strength-meter';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  policy: boolean = false;
  strength: string = 'weak';
  placeholderPassword: string = '';
  placeholderPassword2: string = '';
  passwordType: string = 'password';
  password2Type: string = 'password';
  email: string | null = null;
  pw: string = 'test';
  pw2: string | null = null;

  checkPw(value: string) {
    this.pw = value;
  }

  setLang() {
    switch (environment.DefaultLang) {
      case 'hu':
        this.placeholderPassword = 'Jelszó';
        this.placeholderPassword2 = 'Jelszó megerősítés';
        break;
      case 'en':
        this.placeholderPassword = 'Password';
        this.placeholderPassword2 = 'Password confirm';
        break;

      default:
        break;
    }
  }
  togglePassword() {
    this.checkPasswordStrength(this.pw);
    console.log(this.pw);
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }
  togglePassword2() {
    if (this.password2Type === 'password') {
      this.password2Type = 'text';
    } else {
      this.password2Type = 'password';
    }
  }
  constructor(
    public authService: AuthService,
    public meter: IPasswordStrengthMeterService
  ) {}
  ngOnInit() {
    this.setLang();
  }
  checkPasswordStrength(password: string): void {
    this.pw = password;
    switch (this.meter.score(this.pw)) {
      case 0:
        this.strength = 'weak';
        break;
      case 1:
        this.strength = 'weak';
        break;
      case 2:
        this.strength = 'medium';
        break;
      case 3:
        this.strength = 'medium';
        break;
      case 4:
        this.strength = 'strong';
        break;

      default:
        break;
    }
  }
}
