import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class GoogleCalendarService {
  private readonly calendarApiBaseUrl =
    'https://www.googleapis.com/calendar/v3';

  constructor(private http: HttpClient) {}
   // Function to add an event to the user's calendar
   addEvent(accessToken: string, event: any): Promise<any> {
    const url = `${this.calendarApiBaseUrl}/calendars/primary/events`;

    // Set up headers with the access token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post(url, JSON.stringify(event), { headers })
      .toPromise()
      .then((response) => response)
      .catch((error) => {
        console.error('Error adding event:', error);
        throw error;
      });
  }
}
