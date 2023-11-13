import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private loaded = false;

  loadAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loaded) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.google.apiKey}`;
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = (error: any) => {
        reject(error);
      };
      document.body.appendChild(script);
    });
  }
  constructor() { }
}
