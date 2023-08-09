import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent {

  currentDate = new Date();

  
}
function addOneDay(date = new Date()) {
  date.setDate(date.getDate() + 1);

  return date;
}
