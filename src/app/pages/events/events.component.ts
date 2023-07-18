import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from './interface/events';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent {

  currentDate = new Date();

  todo: Event[] = [
    {
      title: 'Buy milk',
      description: 'Go to the store and buy milk',
      start_time: this.currentDate,
      end_time: this.currentDate,
      location: 'loco',
      organizer_id: 2,
      ticket_price: 2,
      tickets_available: true,
      event_image: null,
    },
    {
      title: 'Create a Kanban app',
      description: 'Using Firebase and Angular create a Kanban app!',
      start_time: this.currentDate,
      end_time: this.currentDate,
      location: 'loco',
      organizer_id: 3,
      ticket_price: 3,
      tickets_available: true,
      event_image: null,
    },
  ];
}
function addOneDay(date = new Date()) {
  date.setDate(date.getDate() + 1);

  return date;
}
