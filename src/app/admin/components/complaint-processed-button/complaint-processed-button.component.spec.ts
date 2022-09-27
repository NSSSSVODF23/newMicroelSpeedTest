import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintProcessedButtonComponent } from './complaint-processed-button.component';

describe('ComplaintProcessedButtonComponent', () => {
  let component: ComplaintProcessedButtonComponent;
  let fixture: ComponentFixture<ComplaintProcessedButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplaintProcessedButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplaintProcessedButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
