import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurePageComponent } from './measure-page.component';

describe('MeasurePageComponent', () => {
  let component: MeasurePageComponent;
  let fixture: ComponentFixture<MeasurePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasurePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
