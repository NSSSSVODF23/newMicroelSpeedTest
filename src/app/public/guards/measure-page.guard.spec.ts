import { TestBed } from "@angular/core/testing";

import { MeasurePageGuard } from "./measure-page.guard";

describe("MeasurePageGuardGuard", () => {
	let guard: MeasurePageGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(MeasurePageGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
