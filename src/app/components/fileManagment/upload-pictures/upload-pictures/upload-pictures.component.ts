

import { Component, OnInit } from '@angular/core';
import { FileUploadService } from 'src/app/services/file/file-upload.service';
import { FileUpload } from 'src/app/models/file/file-upload';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-upload-pictures',
  templateUrl: './upload-pictures.component.html',
  styleUrls: ['./upload-pictures.component.scss']
})

export class UploadPicturesComponent {
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;
  fileUploads?: FileUpload[];
  constructor(private uploadService: FileUploadService) {}

  ngOnInit(): void {this.retrieveFiles()}

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;

      if (file) {
        this.currentFileUpload = new FileUpload(file);
        this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(
          (percentage) => {
            this.percentage = Math.round(percentage ? percentage : 0);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
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
    console.log(this.fileUploads);
  }
}
