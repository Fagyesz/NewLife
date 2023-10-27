import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models/event/event.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import {Timepicker, Datepicker, Input, initTE } from 'tw-elements';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
})
export class EventCreateComponent implements OnInit {
  event: Event = new Event();
  submitted = false;
  published=false;
  userName:string|null=null;

  constructor(
    private eventService: EventService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void { initTE({ Datepicker, Input,Timepicker });
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
      if(this.event.title==null||this.event.title==undefined||this.event.title==''){
        this.toastr.error('Title is required!');
        return console.error('Title is required!');}
      if(this.event.description==null||this.event.description==undefined||this.event.description==''){
         this.toastr.error('Description is required!');
        return console.error('Description is required!');
      }
      if(this.event.location==null||this.event.location==undefined||this.event.location==''){
        this.toastr.error('Location is required!');
        return console.error('Location is required!');
      }
      if(this.event.date==null||this.event.date==undefined){
        this.toastr.error('Date is required!');
        return console.error('Date is required!');
      }
      if(this.event.time==null||this.event.time==undefined){
        this.toastr.error('Time is required!');
        return console.error('Time is required!');
      }
      if(this.event.ticket_price==null||this.event.ticket_price==undefined){
        this.toastr.error('Ticket Price is required!');
        return console.error('Ticket Price is required!');
      }
      if(this.event.tickets_available==null||this.event.tickets_available==undefined){
        this.toastr.error('Tickets Available is required!');
        return console.error('Tickets Available is required!');
      }

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
  getUserName():string|null{
    if(this.authService.getCurrentUser()){
      return this.authService.getCurrentUser().displayName;
    }
    return null;
  }
}
