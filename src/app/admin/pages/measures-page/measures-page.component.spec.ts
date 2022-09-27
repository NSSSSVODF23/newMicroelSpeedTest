import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MeasuresPageComponent} from './measures-page.component';

describe('IndexPageComponent', () => {
    let component: MeasuresPageComponent;
    let fixture: ComponentFixture<MeasuresPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeasuresPageComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeasuresPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
