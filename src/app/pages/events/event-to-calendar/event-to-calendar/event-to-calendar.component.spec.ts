import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventToCalendarComponent } from './event-to-calendar.component';

describe('EventToCalendarComponent', () => {
  let component: EventToCalendarComponent;
  let fixture: ComponentFixture<EventToCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventToCalendarComponent]
    });
    fixture = TestBed.createComponent(EventToCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
