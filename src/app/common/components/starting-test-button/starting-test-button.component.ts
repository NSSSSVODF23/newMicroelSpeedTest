import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TestingService } from "src/app/public/service/measure/testing.service";
import { MeasureConnectionTypes } from "../../transport/enums/connection-types";

@Component({
	selector: "app-starting-test-button",
	templateUrl: "./starting-test-button.component.html",
	styleUrls: ["./starting-test-button.component.scss"],
})
export class StartingTestButtonComponent implements OnInit {
	@Input() label: string = "";
	@Input() icon: string = "";
	@Input() round: boolean = true;
	@Input() connectionType: MeasureConnectionTypes = MeasureConnectionTypes.WIFI;
	@Input() primaryStyle: boolean = true;

	constructor(readonly router: Router, readonly measure: TestingService) {}

	ngOnInit(): void {}

	start(): void {
		this.measure.connectionType = this.connectionType;
		this.router.navigate(["/measure"]);
	}
}
