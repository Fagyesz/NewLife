import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BubblesComponent } from '../../shared/bubbles/bubbles';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-rolunk',
  imports: [RouterModule, BubblesComponent, AnimateOnScrollDirective],
  templateUrl: './rolunk.html',
  styleUrl: './rolunk.scss'
})
export class Rolunk {

}
