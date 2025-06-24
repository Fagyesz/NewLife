import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from './shared/navigation/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Új Élet Baptista Gyülekezet';
}
