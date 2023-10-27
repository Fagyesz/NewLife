import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models//event/event.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  events?: Event[];
  currentEvent?: Event;
  currentIndex = -1;
  title = '';
  constructor(private eventService: EventService) {}
  ngOnInit(): void {
    this.retrieveEvents();
  }
  refreshList(): void {
    this.currentEvent = undefined;
    this.currentIndex = -1;
    this.retrieveEvents();
  }

  retrieveEvents(): void {
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
      });
  }

  setActiveEvent(event: Event, index: number): void {
    this.currentEvent = event;
    this.currentIndex = index;
  }
  CardInfo(id: string | undefined): void {
    if (id !== undefined) {
      console.log(id);
    }
  }
}
