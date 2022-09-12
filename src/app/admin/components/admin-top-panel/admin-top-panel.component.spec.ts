import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopPanelComponent } from './admin-top-panel.component';

describe('AdminTopPanelComponent', () => {
  let component: AdminTopPanelComponent;
  let fixture: ComponentFixture<AdminTopPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTopPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTopPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
