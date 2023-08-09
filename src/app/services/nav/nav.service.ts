import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  private modalStateSubject = new Subject<boolean>();
  modalState$ = this.modalStateSubject.asObservable();

  openModal() {
    this.modalStateSubject.next(true);
  }

  closeModal() {
    this.modalStateSubject.next(false);
  }
}
