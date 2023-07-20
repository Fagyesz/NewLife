import { Component, inject} from '@angular/core';
import { AppCheck } from '@angular/fire/app-check';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  private appCheck: AppCheck = inject(AppCheck);
}
