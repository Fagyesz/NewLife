import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../../models/file/file.model';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore'; // Add this import

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private basePath = '/uploads';
  filesRef: AngularFirestoreCollection<FileUpload>;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore
  ) {
    this.filesRef = firestore.collection(this.basePath);
  }
  pushFileToStorage(fileUpload: FileUpload): Observable<number | undefined> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(() => {
          storageRef.getDownloadURL().subscribe((downloadURL) => {
            fileUpload.url = downloadURL;
            fileUpload.name = fileUpload.file.name;
            this.saveFileData(fileUpload);
          });
        })
      )
      .subscribe();

    return uploadTask.percentageChanges();
  }

  /* private saveFileData(fileUpload: FileUpload): void {
    this.db.list(this.basePath).push(fileUpload);
  } */
  private saveFileData(fileUpload: FileUpload): void {
    // Use Firestore collection instead of AngularFireDatabase
    const { file, ...dataToStore } = fileUpload;

    // Store only the relevant data in Firestore
    this.firestore.collection(this.basePath).add(dataToStore);
    console.log('tried to upload');
  }
  getAll(): AngularFirestoreCollection<FileUpload> {
    
    return this.filesRef;
  }

delete(fileUpload: FileUpload): Promise<void> {
  
    if (this.filesRef) {
      return this.filesRef.doc(fileUpload.id).delete().then(() => {
        this.deleteFileStorage(fileUpload.name);
        console.log("deletestrorage: "+fileUpload.name)
      })
      .catch((error) => console.log(error));
    } else {
      console.error('Collection reference is null.');
      return Promise.reject('Collection reference is null.');
    }
  }




  getFiles(numberItems: number): AngularFireList<FileUpload> {
    return this.db.list(this.basePath, (ref) => ref.limitToLast(numberItems));
  }

  /* deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.id)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch((error) => console.log(error));
  } */

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.basePath);
    storageRef.child(name).delete();
  }
}
