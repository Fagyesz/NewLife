
import { environment } from 'src/environment/environment';
import { MapService } from 'src/app/services/map/map.service';
import { Component, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements AfterViewInit {

  constructor(private googleMapsService: MapService,private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document) { }
  // Set your Google Maps API Key
  apiKey = environment.google.apiKey;

  ngAfterViewInit() {
    this.loadGoogleMapsScript();
  }
  private loadGoogleMapsScript() {
    const script = this.renderer.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.google.apiKey}&libraries=places`;
    script.defer = true;
    script.async = true;

    script.onload = () => {
      // The Google Maps API script has loaded, you can now initialize the map.
      this.initializeGoogleMap();
    };

    script.onerror = () => {
      console.error('Error loading Google Maps API script.');
    };

    this.renderer.appendChild(this.document.body, script);
  }

  private initializeGoogleMap() {
    // Initialize Google Map here, using the 'google' global object.
    const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      // Map options
    });

    new google.maps.Marker({
      // Marker options
    });
  }
}
