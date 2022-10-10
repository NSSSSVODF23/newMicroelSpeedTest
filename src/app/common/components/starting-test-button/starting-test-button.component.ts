import {Component, Input, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {TestingService} from "src/app/public/service/testing.service";
import {MeasureConnectionTypes} from "../../transport/enums/connection-types";

@Component({
    selector: "app-starting-test-button",
    templateUrl: "./starting-test-button.component.html",
    styleUrls: ["./starting-test-button.component.scss"],
})
export class StartingTestButtonComponent implements OnInit {
    loading = false;
    @Input() label: string = "";
    @Input() icon: string = "";
    @Input() round: boolean = true;
    @Input() connectionType: MeasureConnectionTypes = MeasureConnectionTypes.WIFI;
    @Input() primaryStyle: boolean = true;
    @Input() disabled: boolean = false;
    @Input() target = "/measure";

    constructor(readonly router: Router, readonly measure: TestingService) {
    }

    ngOnInit(): void {
    }

    start(): void {
        this.loading = true;
        this.measure.connectionType = this.connectionType;
        setTimeout(() =>
                this.router.navigate([this.target]).then()
            , 500)
    }
}
