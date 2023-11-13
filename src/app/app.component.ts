import { Component, inject } from '@angular/core';
import { AppCheck } from '@angular/fire/app-check';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environment/environment';
import { initFlowbite } from 'flowbite';
import { UserDataService } from './services/user/user-data/user-data.service';
import { AuthService } from './services/auth/auth.service';
import { Lang } from './models/user/lang';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoading: boolean = false;
  loggedIn: boolean = false;
  defaultLang: string = 'hu';
  userLanguage: string = this.defaultLang;
  uid: string | null = null;

  constructor(
    private translate: TranslateService,
    public authService: AuthService,
    public userDataService: UserDataService
  ) {
    translate.setDefaultLang(this.defaultLang); // Set default language

  }

  ngOnInit() {
    initFlowbite();
    // Simulate an API call or any asynchronous operation
    setTimeout(() => {
      this.isLoading = false;
    }, 1);

    this.getLanguage();

  }

  getUid() {
    if (this.authService.getUserUid !== null) {

      this.uid = this.authService.getUserUid();
    } else {
      console.error('User UID is null.');
    }
  }
  getLanguage(){
    this.getUid();
    if (this.uid !== null) {
      this.userDataService.getLanguage(this.uid!).subscribe((language) => {
        if (language !== undefined) {
          this.userLanguage = language;
          this.translate.use(language); // Update the active language
        } else {
          // Handle the case where the language is undefined
          console.error('User language is undefined.');
        }
      });
    } else {
      console.error('User UID is null.');
    }
  }
  onLanguageChange(newLanguage: Lang) {
    if (this.uid !== null) {
      this.userDataService
        .setLanguage(this.uid, newLanguage)
        .then(() => {
          console.log(`User's language updated to ${newLanguage}`);
          this.translate.use(newLanguage); // Update the active language
        })
        .catch((error) => {
          console.error('Error updating user language:', error);
        });
    } else {
      console.error('User UID is null. Unable to update language.');
    }
  }

}
