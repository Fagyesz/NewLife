import { Component, OnInit } from '@angular/core';
import { Lang } from 'src/app/models/user/lang';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';
import { environment } from 'src/environment/environment';
import { HotToastService } from '@ngneat/hot-toast';

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
  editable: boolean = false;

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
    public userDataService: UserDataService,
    private toast: HotToastService,
  ) {}
  onLanguageChange(newLanguage: string) {
    // Check if the UID is available and not null
    switch (newLanguage) {
      case 'en':
        this.selectedLanguage = Lang.English;
        break;
      case 'hu':
        this.selectedLanguage = Lang.Hungarian;
        break;
      case 'ro':
        this.selectedLanguage = Lang.Romanian;
        break;

      default:
        console.error('Language not found.');
        break;
    }
    if (this.uid !== null) {
      if (this.selectedLanguage !== null) {
        this.userDataService
          .setLanguage(this.uid, this.selectedLanguage)
          .then(() => {
            console.log(`User's language updated to ${this.selectedLanguage}`);
          })
          .catch((error) => {
            console.error('Error updating user language:', error);
          });
      } else {
        console.error('Selected language is null. Unable to update language.');
      }
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
  saveData() {
    if (this.uid !== null||this.description!== undefined||this.title!== undefined||this.active!== undefined) {
      this.updateUserData(this.uid!, this.title!, this.description!, this.active!);

    } else {
      console.error('User UID is null.');
    }
  }
  updateUserData(
    uid: string,
    title: string,
    description: string,
    active: boolean

  ) {
    console.log(uid, title, description, active);
    if (this.uid !== null) {
      this.userDataService.setTDA(uid, title, description, active);
      this.toast.success('Data saved successfully!');
    } else {
      console.error('User UID is null.');
    }
  }
  deactivateUser() {
    if (this.uid !== null) {
      this.userDataService.setActive(this.uid,false);
      this.toast.warning('User is deactivated!');
    } else {
      console.error('User UID is null.');
    }
  }
  activateUser() {
    if (this.uid !== null) {
      this.userDataService.setActive(this.uid,true);
      this.toast.success('User is activated!');

    } else {
      console.error('User UID is null.');
    }
  }
  edit() {
    this.editable = !this.editable;

    if (this.editable) {
      this.toast.success('You can edit your data now!');
    }
    else{
      this.toast.warning('You can not edit your data anymore!');
    }

  }

  
}
