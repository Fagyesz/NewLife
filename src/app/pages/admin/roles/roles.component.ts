import { Component, OnInit } from '@angular/core';

import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { User } from 'src/app/models/user/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';
import { NavService } from "src/app/services/nav/nav.service";

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {

  
  openModal() {
    this.navService.openModal();
    console.log("true in roles");
  }

  // Method to close the modal
  closeModal() {
    this.navService.closeModal();
    console.log(" in roles");
  }

  users?: any;
  constructor(public userDataService: UserDataService,public authService: AuthService,private navService:NavService) {}
  ngOnInit(): void {this.retrieveUsers();}

  retrieveUsers(): void {
    this.userDataService
      .getAllVerified()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data) => {
        this.users = data;
        console.log( this.users)
      });
  }
}
