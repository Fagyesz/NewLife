import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models/event/event.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Timepicker, Datepicker, Input, initTE } from 'tw-elements';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
})
export class EventCreateComponent implements OnInit {
  event: Event = new Event();
  submitted = false;
  published = false;
  userName: string | null = null;
  toastText:string="";

  constructor(
    private eventService: EventService,
    public authService: AuthService,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    initTE({ Datepicker, Input, Timepicker });
    const datepickerDisablePast = document.getElementById(
      'datepicker-disable-past'
    );
    new Datepicker(datepickerDisablePast, {
      disablePast: true,
    });
    this.getUserName();
  }

  saveEvent(): void {
    if (this.authService.getCurrentUser()) {
      if (
        this.event.title == null ||
        this.event.title == undefined ||
        this.event.title == ''
      ) {
        this.toast.error('Title is required!');
        return console.error('Title is required!');
      }
      if (
        this.event.description == null ||
        this.event.description == undefined ||
        this.event.description == ''
      ) {
        this.toast.error('Description is required!');
        return console.error('Description is required!');
      }
      if (
        this.event.location == null ||
        this.event.location == undefined ||
        this.event.location == ''
      ) {
        this.event.location = 'Gyöngyös';
        //this.toast.warning('Location is Gyöngyös!');
        this.toastText+='Location is Gyöngyös!';
      }
      if (this.event.date == null || this.event.date == undefined) {
        this.toast.error('Date is required!');
        return console.error('Date is required!');
      }
      if (this.event.time == null || this.event.time == undefined) {
        this.toast.error('Time is required!');
        return console.error('Time is required!');
      }
      if (
        this.event.ticket_price == null ||
        this.event.ticket_price == undefined
      ) {
        this.event.ticket_price = null;
        //this.toast.warning('Ticket Price is Free !');
        if(this.toastText)this.toastText+=' Ticket Price is Free !';
      }
      if (
        this.event.tickets_number == null ||
        this.event.tickets_number == undefined
      ) {
        this.event.tickets_number = null;
        //this.toast.warning('Tickets Available is unlimited!');
        if(this.toastText)this.toastText+=' Tickets Available is unlimited!';
      }

      this.event.organizer_id = this.authService.getCurrentUser().uid;
      this.eventService.create(this.event).then(() => {
        this.toast.success('Created new item successfully!');
        if(this.toastText)this.toast.warning(this.toastText);
        console.log('Created new item successfully!');
        this.submitted = true;
        this.toastText="";
      });
    } else {
      this.toast.error('Not logged in!');
      console.log('Not logged in!');
    }
  }

  newEvent(): void {
    this.submitted = false;
    this.event = new Event();
  }
  getUserName(): string | null {
    if (this.authService.getCurrentUser()) {
      return this.authService.getCurrentUser().displayName;
    }
    return null;
  }
}
