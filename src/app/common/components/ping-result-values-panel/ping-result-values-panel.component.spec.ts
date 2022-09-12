import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PingResultValuesPanelComponent } from './ping-result-values-panel.component';

describe('PingResultValuesPanelComponent', () => {
  let component: PingResultValuesPanelComponent;
  let fixture: ComponentFixture<PingResultValuesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PingResultValuesPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PingResultValuesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
