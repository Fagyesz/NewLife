import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/models/user/role';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserDataService } from 'src/app/services/user/user-data/user-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  title = '';
  description = '';
  userId: string = 'null';

  constructor(
    public authService: AuthService,
    public userdata: UserDataService
  ) {
    if (this.authService.getUserUid() !== null) {
      this.userId = this.authService.getUserUid()!;
    }
  }
  ngOnInit(): void {
    const userUid = this.authService.getUserUid();
    this.userdata.getTitle(this.userId).subscribe((title) => {
      this.title = title!;
      console.log("title: ",title);
    });
    this.userdata.getDescription(this.userId).subscribe((description) => {
      this.description = description!;
      console.log("desc: ",description);
    });
    console.log(userUid);
  }
  setOwner(){
    this.userdata.setOwner("vinczef.o@gmail.com",Role.Owner);
  }
}
