import {TestBed} from '@angular/core/testing';

import {RadarGuard} from './radar.guard';

describe('RadarGuard', () => {
    let guard: RadarGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        guard = TestBed.inject(RadarGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });
});
