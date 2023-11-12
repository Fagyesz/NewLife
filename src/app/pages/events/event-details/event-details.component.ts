import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models//event/event.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Timepicker, Datepicker, Input, initTE } from 'tw-elements';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit {
  events?: Event[];
  event?: Event;
  @Output() refreshList: EventEmitter<any> = new EventEmitter();

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    initTE({ Datepicker, Input, Timepicker });
    const datepickerDisablePast = document.getElementById(
      'datepicker-disable-past'
    );
    if (!datepickerDisablePast) {
      this.toast.error('Datepicker not found');

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
}
