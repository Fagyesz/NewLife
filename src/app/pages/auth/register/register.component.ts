import { Component, OnInit,ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from 'src/environment/environment';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  
  registerForm:FormGroup;

  @ViewChild('userEmail', { static: false }) userEmailInput: ElementRef | undefined;
  @ViewChild('userPwd', { static: false }) userPwdInput: ElementRef| undefined;
  @ViewChild('userPwdConfirm', { static: false }) userPwdConfirmInput: ElementRef| undefined;

  submitted = false;
  isInvalid = false;
  passwordType = 'password';
  placeholderPassword: string = '';
  placeholderPassword2: string = '';

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

  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder
  ) {this.registerForm = this.formBuilder.group(
    {
      email: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
            
            
          ],
          updateOn: 'blur', // Set updateOn to 'blur' for the email form control
        },
      ],
      password: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])?.{8,}$/),
          ],
          updateOn: 'blur',
        },
      ],
      confirmPassword: [
        '',
        {
          validators: [Validators.required,
            Validators.minLength(6),
            Validators.maxLength(40),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/),],
          updateOn: 'blur',
        },
      ],
      acceptTerms: [false, Validators.requiredTrue],
    },
    {
      validators: [this.matchPasswords.bind(this)],
    }
  );
}

  ngOnInit() {
    this.setLang();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    console.log(JSON.stringify(this.registerForm.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }

  matchPasswords(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }
  
}
