import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EulaComponent } from './eula.component';

describe('EulaComponent', () => {
  let component: EulaComponent;
  let fixture: ComponentFixture<EulaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EulaComponent]
    });
    fixture = TestBed.createComponent(EulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
