import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models//event/event.model';
import {  AuthService} from "src/app/services/auth/auth.service";

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {

  @Input() event?: Event;
  @Output() refreshList: EventEmitter<any> = new EventEmitter();
  currentEvent: Event = {
    title: '',
    description: '',
    published: false
  };
  message = '';

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.message = '';
  }

  ngOnChanges(): void {
    this.message = '';
    this.currentEvent = { ...this.event };
  }

  updatePublished(status: boolean): void {
    if (this.currentEvent.id) {
      this.eventService.update(this.currentEvent.id, { published: status })
      .then(() => {
        this.currentEvent.published = status;
        this.message = 'The status was updated successfully!';
      })
      .catch(err => console.log(err));
    }
  }

  updateEvent(): void {
    const data = {
      title: this.currentEvent.title,
      description: this.currentEvent.description
    };

    if (this.currentEvent.id) {
      this.eventService.update(this.currentEvent.id, data)
        .then(() => this.message = 'The event was updated successfully!')
        .catch(err => console.log(err));
    }
  }

  deleteEvent(): void {
    if (this.currentEvent.id) {
      this.eventService.delete(this.currentEvent.id)
        .then(() => {
          this.refreshList.emit();
          this.message = 'The event was updated successfully!';
        })
        .catch(err => console.log(err));
    }
  }
}
