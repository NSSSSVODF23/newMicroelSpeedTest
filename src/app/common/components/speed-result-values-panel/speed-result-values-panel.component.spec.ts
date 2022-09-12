import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedResultValuesPanelComponent } from './speed-result-values-panel.component';

describe('SpeedResultValuesPanelComponent', () => {
  let component: SpeedResultValuesPanelComponent;
  let fixture: ComponentFixture<SpeedResultValuesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeedResultValuesPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedResultValuesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
