import {Component, Input, OnInit} from "@angular/core";
import {TestingService} from "src/app/public/service/measure/testing.service";

@Component({
    selector: "app-ping-result-values-panel",
    templateUrl: "./ping-result-values-panel.component.html",
    styleUrls: ["./ping-result-values-panel.component.scss"],
})
export class PingResultValuesPanelComponent implements OnInit {
    @Input() ping: string = "-";
    @Input() jitter: string = "-";
    @Input() isPro: boolean = false;

    constructor(readonly measure: TestingService) {
    }

    ngOnInit(): void {
    }
}
