import { Time } from "@angular/common";

export class Event {
    id?: string;
    title?: string;
    description?: string|null;
    date?:Date;
    time?:Time;
    location?: string;
    organizer_id?:Number;
    ticket_price?:Number|null;
    tickets_number?:Number|null;
    event_image?:Location|null;
    published?:boolean;
    active?:boolean;
}
