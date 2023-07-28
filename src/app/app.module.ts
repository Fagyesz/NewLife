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
import { ReactiveFormsModule } from '@angular/forms';

/* pages and components */
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
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { UploadFormComponent } from './components/fileManagment/upload-form/upload-form.component';
import { UploadListComponent } from './components/fileManagment/upload-list/upload-list.component';
import { UploadDetailsComponent } from './components/fileManagment/upload-details/upload-details.component';
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
import { MatGridListModule } from '@angular/material/grid-list';

/* Firebase */

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import {
  ReCaptchaV3Provider,
  initializeAppCheck,
  provideAppCheck,
} from '@angular/fire/app-check';

import { environment } from '../environment/environment';

/* services */
import { AuthService } from './services/auth/auth.service';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';

/* route guard */
import { authGuard } from './guards/auth.guard';
import { DashComponent } from './pages/dash/dash.component';
import { TestComponent } from './pages/test/test.component';
import { PasswordStrengthComponent } from './components/password-strength/password-strength.component';
import { PrivacyComponent } from './pages/policy/privacy/privacy.component';
import { CookieComponent } from './pages/policy/cookie/cookie.component';
import { TermsOfServiceComponent } from './pages/policy/terms-of-service/terms-of-service.component';
import { EulaComponent } from './pages/policy/eula/eula.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { RolesComponent } from './pages/admin/roles/roles.component';
import { AdminComponent } from './pages/admin/admin.component';


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
    UploadFormComponent,
    UploadListComponent,
    UploadDetailsComponent,
    TestComponent,
    PasswordStrengthComponent,
    PrivacyComponent,
    CookieComponent,
    TermsOfServiceComponent,
    EulaComponent,
    DashboardComponent,
    RolesComponent,
    AdminComponent,

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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAppCheck(() =>
      initializeAppCheck(getApp(), {
        provider: new ReCaptchaV3Provider(environment.reCAPTCHA3Site),
        isTokenAutoRefreshEnabled: true,
      })
    ),
    ReactiveFormsModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
