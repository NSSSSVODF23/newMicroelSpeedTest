import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLinksMenuComponent } from './admin-links-menu.component';

describe('AdminLinksMenuComponent', () => {
  let component: AdminLinksMenuComponent;
  let fixture: ComponentFixture<AdminLinksMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLinksMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLinksMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
