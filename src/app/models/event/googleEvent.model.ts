import { Time } from '@angular/common';

export class GoogleEvent {
  summary?: string;
  location?: string;
  description?: string | null;
  start?: {DateTime: string, TimeZone: string} |null;
  end?: {DateTime: string, TimeZone: string} |null;

  /*     'summary': 'Example Event',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2022-01-01T09:00:00-07:00',
    'timeZone': 'Hungary/Budapest'
  },
  'end': {
    'dateTime': '2022-01-01T17:00:00-07:00',
    'timeZone': 'Hungary/Budapest'
  }, */
}
