import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {


  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  
  constructor(public authService: AuthService) {}
}
