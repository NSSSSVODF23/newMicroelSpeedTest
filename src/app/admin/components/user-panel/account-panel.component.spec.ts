import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountPanelComponent} from './account-panel.component';

describe('UserPanelComponent', () => {
    let component: AccountPanelComponent;
    let fixture: ComponentFixture<AccountPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountPanelComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
