import { Component } from '@angular/core';
import { GoogleCalendarService } from 'src/app/services/calendar/google-calendar.service';
import { AuthService } from 'src/app/services/auth/auth.service';
@Component({
  selector: 'app-event-to-calendar',
  templateUrl: './event-to-calendar.component.html',
  styleUrls: ['./event-to-calendar.component.scss']
})
export class EventToCalendarComponent {

  constructor(private googleCalendarService: GoogleCalendarService,public auth:AuthService) { }
  addEventToCalendar() {
    // Replace 'accessToken' with the actual access token obtained during authentication
    const accessToken = 'YOUR_ACCESS_TOKEN';

    // Define the event data (you can customize this according to your needs)
    const event = {
      summary: 'New Event',
      description: 'This is a sample event description',
      start: {
        dateTime: '2023-11-15T10:00:00Z', // Replace with your event start time
        timeZone: 'UTC',
      },
      end: {
        dateTime: '2023-11-15T11:00:00Z', // Replace with your event end time
        timeZone: 'UTC',
      },
    };

    /* this.googleCalendarService.addEvent(accessToken, event)
      .then((response) => {
        console.log('Event added:', response);
        // Handle success, update UI, etc.
      })
      .catch((error) => {
        // Handle error, show error message to the user, etc.
      }); */
  }
}

