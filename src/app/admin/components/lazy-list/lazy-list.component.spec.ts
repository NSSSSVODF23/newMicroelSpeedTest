import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyListComponent } from './lazy-list.component';

describe('LazyListComponent', () => {
  let component: LazyListComponent;
  let fixture: ComponentFixture<LazyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LazyListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LazyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
