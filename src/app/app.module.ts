/* ng */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoadingComponent } from './components/loading/loading.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

/* pages */
import { HomeComponent } from './pages/home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { AboutComponent } from './pages/about/about.component';
import { SermonsComponent } from './pages/sermons/sermons.component';
import { EventsComponent } from './pages/events/events.component';
import { MinistriesComponent } from './pages/ministries/ministries.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HeroComponent } from './pages/home/hero/hero.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { SettingsComponent } from './pages/user/settings/settings.component';
import { ErrorComponent } from './pages/error/error.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ContentComponent } from './pages/home/content/content.component';
import { EventListComponent } from './pages/events/event-list/event-list.component';
import { EventProfileComponent } from './pages/events/event-profile/event-profile.component';
import { EventHomeComponent } from './pages/events/event-home/event-home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/* material */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';


/* translation */
import { TranslationModule } from './translation.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/* Toaster */
import { ToastrModule } from 'ngx-toastr';

/* ng-bootstrap */
import { CarouselsComponent } from './components/carousels/carousels.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

/* ng-material */
import {MatGridListModule} from '@angular/material/grid-list';

/* Firebase */

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environment/environment';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';

/* services */
import { AuthService } from "./services/auth.service";
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';

/* route guard */
import { authGuard } from './guards/auth.guard';
import { DashComponent } from './pages/dash/dash.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    HomeComponent,
    NavComponent,
    AboutComponent,
    SermonsComponent,
    EventsComponent,
    MinistriesComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent,
    CarouselsComponent,
    HeroComponent,
    ProfileComponent,
    SettingsComponent,
    ErrorComponent,
    LoginComponent,
    RegisterComponent,
    ContentComponent,
    EventListComponent,
    EventProfileComponent,
    EventHomeComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    DashComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule, 
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    TranslationModule,
    NgbModule,
    ToastrModule.forRoot(),
    NgbCarouselModule,
    FormsModule,
    NgFor,
    MatGridListModule,
    MatCardModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    

  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
