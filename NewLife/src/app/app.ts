import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from './shared/navigation/navigation';
import { FloatingButtonComponent } from './shared/components/floating-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, FloatingButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Új Élet Baptista Gyülekezet';
}
