import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';
import { FileUploadService } from 'src/app/services/file/file-upload.service';
import { FileUpload } from 'src/app/models/file/file-upload';


@Component({
  selector: 'app-upload-details',
  templateUrl: './upload-details.component.html',
  styleUrls: ['./upload-details.component.scss']
})
export class UploadDetailsComponent implements OnInit {
  @Input() fileUpload!: FileUpload;
  @Output() refreshList: EventEmitter<any> = new EventEmitter();
  currentFileId:string="";
  message = '';


  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
    console.log("file upload: "+this.fileUpload);
  }
  ngOnChanges(): void {
    this.message = '';
    
  }

  deleteFileUpload(fileUpload: FileUpload): void {
    if (this.fileUpload.id) {
      this.uploadService.delete(fileUpload)
        .then(() => {
          this.refreshList.emit();
          this.message = 'The event was updated successfully!';
        })
        .catch(err => console.log(err));
    }
    
    
  }
  

  
}
