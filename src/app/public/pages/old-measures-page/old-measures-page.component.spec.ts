import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldMeasuresPageComponent } from './old-measures-page.component';

describe('OldMeasuresPageComponent', () => {
  let component: OldMeasuresPageComponent;
  let fixture: ComponentFixture<OldMeasuresPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OldMeasuresPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OldMeasuresPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
