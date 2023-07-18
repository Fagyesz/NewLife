export interface Event {
    id?: string;
    title: string;
    description: string|null;
    start_time:Date;
    end_time:Date;
    location: string;
    organizer_id:Number;
    ticket_price:Number;
    tickets_available:Boolean;
    event_image:Location|null;
  }
  