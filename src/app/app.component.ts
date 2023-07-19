import { Component, inject } from '@angular/core';
import { AppCheck } from '@angular/fire/app-check';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoading: boolean = false;
  loggedIn: boolean = false;
  private appCheck: AppCheck = inject(AppCheck);

  constructor(private translate: TranslateService,) {
    translate.setDefaultLang('hu'); // Set default language
  }

  switchLanguage(lang: string) {
    this.translate.use(lang); // Switch language
  }

  ngOnInit() {
    // Simulate an API call or any asynchronous operation
    setTimeout(() => {
      this.isLoading = false;
    }, 0.1);


    
  }


}
