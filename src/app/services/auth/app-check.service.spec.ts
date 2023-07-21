import { TestBed } from '@angular/core/testing';

import { AppCheckService } from './app-check.service';

describe('AppCheckService', () => {
  let service: AppCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
