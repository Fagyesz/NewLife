import { Component, OnInit } from '@angular/core';
import { Lang } from 'src/app/models/user/lang';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  selectedLanguage: Lang | null = null;
  uid: string | null = null;
  role: string | null = null;
  title: string | null = null;
  description: string | null = null;
  active: boolean | null = null;
  defaultPhotoUrl = environment.DefaultPhotoUrl;

  ngOnInit(): void {
    this.uid = this.authService.getUserUid();
    this.getData();
    if (this.userDataService.getLanguage !== null && this.uid !== null) {
      this.userDataService.getLanguage(this.uid).subscribe((language) => {
        if (language !== undefined) {
          this.selectedLanguage = language as Lang;
        } else {
          // Handle the case where the language is undefined
        }
      });



    } else {
      // Handle the case where the language is null
    }
  }

  constructor(
    public authService: AuthService,
    public userDataService: UserDataService
  ) {}
  onLanguageChange(newLanguage: Lang) {
    // Check if the UID is available and not null
    if (!(Object.values(newLanguage).includes(newLanguage as Lang))) {
      console.error('Invalid Language');
      return;
    }
    if (this.uid !== null) {
      this.userDataService
        .setLanguage(this.uid, newLanguage)
        .then(() => {
          console.log(`User's language updated to ${newLanguage}`);
        })
        .catch((error) => {
          console.error('Error updating user language:', error);
        });
    } else {
      console.error('User UID is null. Unable to update language.');
    }
  }
  updatePhotoUrl(uid: string, photoURL: string) {
    if (this.uid !== null) {
      this.userDataService.setPhotoUrl(uid, photoURL);
    } else {
      console.error('User UID is null.');
    }
  }
  deletePhotoUrl() {
    if (this.uid !== null) {
      this.updatePhotoUrl(this.uid, this.defaultPhotoUrl);
    }
  }
  getData() {
    if (this.uid !== null) {
      this.userDataService.getRole(this.uid).subscribe((role) => {
        if (role !== undefined) {
          this.role = role;
        } else {
          // Handle the case where the role is undefined
        }
      });

      this.userDataService.getTitle(this.uid).subscribe((title) => {
        if (title !== undefined) {
          this.title = title;
        } else {
          // Handle the case where the title is undefined
        }
      });

      this.userDataService.getDescription(this.uid).subscribe((description) => {
        if (description !== undefined) {
          this.description = description;
        } else {
          // Handle the case where the description is undefined
        }
      });

      this.userDataService.getActive(this.uid).subscribe((active) => {
        if (active !== undefined) {
          this.active = active;
        } else {
          // Handle the case where the active status is undefined
        }
      });
    } else {
      console.error('User UID is null.');
    }
  }
}
