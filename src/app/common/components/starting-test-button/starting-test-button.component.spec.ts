import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingTestButtonComponent } from './starting-test-button.component';

describe('StartingTestButtonComponent', () => {
  let component: StartingTestButtonComponent;
  let fixture: ComponentFixture<StartingTestButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartingTestButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartingTestButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
