import {
  Component,
  Output,
  EventEmitter,
  Injectable,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';

import { Event } from 'src/app/models/event/event.model';
import { EventService } from 'src/app/services/event/event.service';
import { Datepicker, Input, initTE } from 'tw-elements';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  currentDate = new Date();
  hideModal = false;
  constructor(public eventService: EventService,private router: Router) {}

  ngOnInit() {
    /*  this.eventService.getAll().subscribe((events) => {
      this.events = events;
    }); */
    initTE({ Datepicker, Input });
    const datepickerDisablePast = document.getElementById(
      'datepicker-disable-past'
    );
    new Datepicker(datepickerDisablePast, {
      disablePast: true,
    });
  }

  addOneDay(date = new Date()) {
    date.setDate(date.getDate() + 1);

    return date;
  }
  navigateToEventDetail(eventId: number) {
    this.router.navigate(['/event', eventId]);
  }
}
