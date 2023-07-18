import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../interface/events';
@Component({
  selector: 'app-event-home',
  templateUrl: './event-home.component.html',
  styleUrls: ['./event-home.component.scss']
})
export class EventHomeComponent {
  @Input() event: Event | null = null;
  @Output() edit = new EventEmitter<Event>();
}
