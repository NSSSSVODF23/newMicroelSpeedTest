import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ComplaintsPageComponent} from './complaints-page.component';

describe('ComplaintPageComponent', () => {
    let component: ComplaintsPageComponent;
    let fixture: ComponentFixture<ComplaintsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ComplaintsPageComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ComplaintsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
