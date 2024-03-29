import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models//event/event.model';
import { GoogleEvent } from 'src/app/models/event/googleEvent.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Timepicker, Datepicker, Input, initTE } from 'tw-elements';
import { HotToastService } from '@ngneat/hot-toast';
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoogleCalendarService } from 'src/app/services/calendar/google-calendar.service';
declare var createGoogleEvent: any;
@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit {
  start = new Date();
  end = new Date();
  year: string|undefined;
  month: string|undefined;
  day: string|undefined;
  hours: string|undefined;
  minutes: string|undefined;
  GoogleDateTimeStart: string|undefined;
  GoogleDateTimeEnd: string|undefined;
  scheduleMeeting() {

    this.eventToEvent(this.event!);
    console.log('cLICKED');
    const eventDetails = {
      startTime: this.GoogleDateTimeStart,
      endTime: this.GoogleDateTimeEnd,
      summary: this.event?.title,
      description: this.event?.description,
      location: this.event?.location,
    };
    console.info(eventDetails);
    createGoogleEvent(eventDetails);
    //https://github.com/dnyaneshwargiri/angular-tutorials/tree/main/google-calender-app
  }

  onAddToCalendar() {
    this.scheduleMeeting();
  }
  eventToEvent(event: Event): any {
    if (event) {
      const googleEvent: GoogleEvent = new GoogleEvent();
      googleEvent.summary = event.title;
      googleEvent.description = event.description;
      googleEvent.location = event.location;
      if (event.date && event.time) {
        // convert date and time to datetime
        const date = new Date();
        console.log(event.date);

        let datestring: string = event.date.toString();



       this.year = datestring.split('/')[2];
       this.month = datestring.split('/')[1];
       this.day = datestring.split('/')[0];
        console.log('year', this.year, 'month', this.month, 'day', this.day);
        let time: string = event.time.toString();

        console.log(time);
        this.hours = time.split(':')[0];
        this.minutes = time.split(':')[1];
        console.log('hours',this. hours, 'minutes', this.minutes);

        this.GoogleDateTimeStart =
          this.year + '-' +this. month + '-' + this.day + 'T' + this.hours + ':' + this.minutes + ':00Z';

        date.setFullYear(parseInt(this.year), parseInt(this.month), parseInt(this.day));
        date.setHours(parseInt(this.hours));
        date.setMinutes(parseInt(this.minutes));
        console.log(date);
        this.start = date;
        googleEvent.start = {
          DateTime: this.GoogleDateTimeStart,
          TimeZone: 'Europe/Budapest',
        };

        date.setHours(date.getHours() + 3);
        this.end = date;
        this.year = date.getFullYear().toString();
        this.month = date.getMonth().toString();
        this.day = date.getDate().toString();
        this.hours = date.getHours().toString();
        this.minutes = date.getMinutes().toString();

        this.GoogleDateTimeEnd =
          this.year + '-' + this.month + '-' + this.day + 'T' + this.hours + ':' + this.minutes + ':00Z';
        googleEvent.end = {
          DateTime: this.GoogleDateTimeEnd,
          TimeZone: 'Europe/Budapest',
        };
        //console.log(googleEvent);
        return googleEvent;
      }
      return googleEvent;
    } else {
      return undefined;
    }
  }

  events?: Event[];
  event?: Event;
  googleEvent?: GoogleEvent = new GoogleEvent();
  @Output() refreshList: EventEmitter<any> = new EventEmitter();

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private toast: HotToastService,
    private userdataservice: UserDataService,
    private authService: AuthService,
    private http: HttpClient,
    private calendarService: GoogleCalendarService
  ) {}

  ngOnInit(): void {
    initTE({ Datepicker, Input, Timepicker });
    const datepickerDisablePast = document.getElementById(
      'datepicker-disable-past'
    );
    if (!datepickerDisablePast) {
      //this.toast.error('Datepicker not found');
    } else {
      new Datepicker(datepickerDisablePast, {
        disablePast: true,
      });
    }

    this.route.params.subscribe((params) => {
      const eventId = params['id']; // 'id' should match the parameter in the route
      this.retrieveEvents(eventId);
    });
  }
  retrieveEvents(eventId: string): void {
    this.eventService
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data) => {
        this.events = data;
        this.event = this.getEventFromEvents(eventId);
      });
  }

  getEventFromEvents(eventId: string): Event | undefined {
    if (this.events) {
      return this.events.find((event) => event.id === eventId);
    } else {
      return undefined;
    }
  }
  updateEvent(): void {
    if (this.event && this.event.id) {
      const eventId = this.event.id;
      if (eventId) {
        this.eventService.update(eventId, this.event).then(() => {
          console.log('Updated event with ID: ' + eventId);
          this.toast.success('Esemény frissült' );
        });
      } else {
        console.error('Event ID is null or undefined');
      }
    } else {
      console.error('Event is null or undefined');
    }
  }
  deleteEvent(): void {
    if (this.event) {
      const eventId = this.event.id;
      if (eventId) {
        this.eventService.delete(eventId).then(() => {
          console.log('Deleted event with ID: ' + eventId);
          this.refreshList.emit();
        });
      } else {
        console.error('Event ID is null or undefined');
      }
    } else {
      console.error('Event is null or undefined');
    }
  }
  isStaff(): Observable<boolean> {
    if (this.authService.getCurrentUser().uid) {
      console.log(
        this.userdataservice.isStaff(this.authService.getCurrentUser().uid)
      );
      return this.userdataservice.isStaff(
        this.authService.getCurrentUser().uid
      );
    } else {
      return new Observable<boolean>();
    }
  }
}
