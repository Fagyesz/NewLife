import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';

declare var gapi: any;
@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {

  private gapiSetup: boolean = false; // flag to check if gapi is initialized

  private error: string | undefined;

  private clientId: string = environment.google.clientID;
  private scope = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' ');

  public auth2: any;

  constructor() {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId: this.clientId,
        scope: this.scope
      }).then(() => {
        this.auth2 = gapi.auth2.getAuthInstance();
      });
    });
  }

  signIn() {
    return this.auth2.signIn();
  }

  signOut() {
    return this.auth2.signOut();
  }
}
