import {
    animate,
    state,
    style,
    transition,
    trigger,
} from "@angular/animations";
import {Component, Input, OnInit, Output} from "@angular/core";
import {TestingResultValues} from "../../class/speed-counter";

@Component({
    selector: "app-speed-result-values-panel",
    templateUrl: "./speed-result-values-panel.component.html",
    styleUrls: ["./speed-result-values-panel.component.scss"],
    animations: [
        trigger("finishTest", [
            state(
                "finished",
                style({
                    opacity: 1,
                }),
            ),
            state(
                "empty",
                style({
                    opacity: 0.5,
                }),
            ),
            transition("empty => finished", [animate("1s ease-in")]),
        ]),
    ],
})
export class SpeedResultValuesPanelComponent implements OnInit {
    @Input() testType: "download" | "upload" = "download";
    title: string = "Скачивание";
    icon: string = "../../../../assets/img/download.svg";
    @Input() stability: string = "-";
    @Input() loss: string = "-";
    @Input() isPro: boolean = false;
    tested: boolean = false;

    constructor() {
    }

    _speed: string = "-";

    get speed(): string {
        return this._speed;
    }

    @Input() set speed(speed: string) {
        this._speed = speed;
        this.makeTested();
    }

    makeTested(): void {
        if (this.speed !== "-") {
            if (this.testType === "download") {
                this.icon = "../../../../assets/icons/download.svg";
            } else {
                this.icon = "../../../../assets/icons/upload.svg";
            }
            this.tested = true;
        }
    }

    ngOnInit(): void {
        if (this.testType === "download") {
            this.title = "Скачивание";
            this.icon = "../../../../assets/icons/download-inactive.svg";
        } else if (this.testType === "upload") {
            this.title = "Загрузка";
            this.icon = "../../../../assets/icons/upload-inactive.svg";
        }
    }
}
