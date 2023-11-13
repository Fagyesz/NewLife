
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent  {
  ngOnInit() {

    this.initMap();
  }


  initMap(): void {
    /* const gyongyos = { lat: 47.793304, lng: 19.932309 }; // Coordinates for Gyöngyös */
    const gyongyos = { lat: 47.783267490393875, lng: 19.927359962637976 };
    const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      zoom: 16,
      center: gyongyos,
    });

    new google.maps.Marker({
      position: gyongyos,
      map: map,
    });
  }
}
