import { Component, inject } from '@angular/core';
import { AppCheck } from '@angular/fire/app-check';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environment/environment';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoading: boolean = false;
  loggedIn: boolean = false;
  defaultLang:string=environment.DefaultLang;
  userLanguage:string=this.defaultLang;
  constructor(private translate: TranslateService,) {

    translate.setDefaultLang(this.defaultLang); // Set default language
    const userLanguage = (navigator.language).split('-')[0];
  }

  
  switchLanguage(lang: string) {
    
    this.translate.use(this.userLanguage); // Switch language
  }

  ngOnInit() {
    initFlowbite();
    // Simulate an API call or any asynchronous operation
        setTimeout(() => {
      this.isLoading = false;
    }, 0.1);


    
  }


}
