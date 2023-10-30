import { Time } from "@angular/common";

export class Event {
    id?: string;
    title?: string;
    description?: string|null;
    date?:Date;
    time?:Time;
    location?: string;
    organizer_id?:Number;
    ticket_price?:Number;
    tickets_number?:Number;
    event_image?:Location|null;
    published?:boolean;
    active?:boolean;
}
