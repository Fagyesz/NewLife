import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { User } from 'src/app/models/user/user';
import { Role } from 'src/app/models/user/role';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';
import { NavService } from 'src/app/services/nav/nav.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  roleFilter: string | null = null;
  nameFilter: string | null = null;
  filteredUsers: any = null;
  searchQuery: string = '';
  users?: any;
  selectedRole: string | null = null;
  isEditable: boolean = false;

  openModal() {
    this.navService.openModal();
    console.log('true in roles');
  }

  // Method to close the modal
  closeModal() {
    this.navService.closeModal();
    console.log(' in roles');
  }

  constructor(
    public userDataService: UserDataService,
    public authService: AuthService,
    private navService: NavService
  ) {}
  ngOnInit(): void {
    this.retrieveUsers();
  }

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
        this.filteredUsers = data; // Initialize filteredUsers with all users
        console.log(this.users);
      });
  }
  /*   not used right now

   searchUsersByRole() {
    this.filteredUsers = this.users.filter(
      (data: { roles: { admin: boolean; organizer: boolean } }) => {
        if (
          (this.selectedRole === 'admin' && data.roles.admin === true) ||
          (this.selectedRole === 'organizer' &&
            data.roles.organizer === true) ||
          (this.selectedRole === 'staff' &&
            (data.roles.admin || data.roles.organizer))
        ) {
          console.log('admin:', data.roles.admin === true);
          return true;
        }
        console.log('admin:', data.roles.admin === false);
        return false;
      }
    );
  } */

  // Function to filter users based on name
  searchUsersByName() {
    this.filteredUsers = this.users.filter((data: { displayName: string }) => {
      if (!this.searchQuery) {
        return true;
      }

      return data.displayName
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
    });
  }
  userDeactivate(): void {
    if (this.authService.getUserUid()) {
      this.userDataService.setActive(this.authService.getUserUid()!, false);
    }
  }
  userActivate(): void {
    if (this.authService.getUserUid()) {
      this.userDataService.setActive(this.authService.getUserUid()!, true);
    }
  }
  switchEditable() {
    this.isEditable = !this.isEditable;
    console.log(this.isEditable);
  }
  setUserRole(uid: string, role: Role) {
    if (this.authService.getUserUid() === uid) {
      this.userDataService.setRole(uid, role);
    }
  }
}
