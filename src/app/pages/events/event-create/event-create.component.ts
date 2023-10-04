import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models/event/event.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import {Timepicker, Datepicker, Input, initTE } from 'tw-elements';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
})
export class EventCreateComponent implements OnInit {
  event: Event = new Event();
  submitted = false;
  published=false;

  constructor(
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void { initTE({ Datepicker, Input,Timepicker });
  const datepickerDisablePast = document.getElementById(
    'datepicker-disable-past'
  );
  new Datepicker(datepickerDisablePast, {
    disablePast: true,
  });}

  saveEvent(): void {
    if (this.authService.getCurrentUser()) {
      this.event.organizer_id = this.authService.getCurrentUser().uid;
      this.eventService.create(this.event).then(() => {
        console.log('Created new item successfully!');
        this.submitted = true;
      });
    } else {
      console.log('Not logged in!');
    }
  }

  newEvent(): void {
    this.submitted = false;
    this.event = new Event();
  }
}
