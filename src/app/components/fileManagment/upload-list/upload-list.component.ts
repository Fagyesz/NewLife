import { Component, OnInit } from '@angular/core';
import { FileUploadService } from 'src/app/services/file/file-upload.service';
import { FileUpload } from 'src/app/models/file/file.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss']
})
export class UploadListComponent implements OnInit {
  fileUploads?: FileUpload[];

  constructor(private uploadService: FileUploadService) { }

 
      ngOnInit(): void {
        this.retrieveFiles();
  }
  retrieveFiles(): void {
    this.uploadService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.fileUploads = data;
    });
   
  }
}
