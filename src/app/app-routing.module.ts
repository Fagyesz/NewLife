import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SermonsComponent } from './pages/sermons/sermons.component';
import { EventsComponent } from './pages/events/events.component';
import { MinistriesComponent } from './pages/ministries/ministries.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ErrorComponent } from './pages/error/error.component';
import { ProfileComponent } from './pages/user/profile/profile.component';
import { SettingsComponent } from './pages/user/settings/settings.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { DashComponent } from './pages/dash/dash.component';
import { TestComponent } from './pages/test/test.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EventListComponent } from './pages/events/event-list/event-list.component';
import { EventCreateComponent } from './pages/events/event-create/event-create.component';
import { EventDetailsComponent } from './pages/events/event-details/event-details.component';
import { EventToCalendarComponent } from './pages/events/event-to-calendar/event-to-calendar/event-to-calendar.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'about', component: AboutComponent },
  { path: 'sermons', component: SermonsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'ministries', component: MinistriesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', redirectTo: '/logout' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify', component: VerifyEmailComponent },
  { path: 'dash', component: DashComponent },
  { path: 'test', component: TestComponent },
  { path: 'event-test', component: EventListComponent },
  { path: 'event-create', component: EventCreateComponent },
  { path: 'event/:id', component: EventDetailsComponent },
  { path: 'eventcalendar', component: EventToCalendarComponent },
  { path: '404', component: ErrorComponent },
  { path: '**', component: ErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
