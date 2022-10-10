import {animate, animateChild, query, state, style, transition, trigger} from "@angular/animations";
import {BreakpointObserver} from "@angular/cdk/layout";
import {HttpClient} from "@angular/common/http";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TestingResultValues} from "src/app/common/class/speed-counter";
import {SpeedChartPoint} from "src/app/common/components/speed-chart/speed-chart.component";
import {Measure} from "src/app/common/transport/models/measure";
import {TestingService} from "../../service/testing.service";
import {TestingStage} from "../../../common/transport/enums/testing-stage";
import {PublicApiService} from "../../service/public-api.service";
import {Title} from "@angular/platform-browser";

const animations = [
    trigger("flowResult", [
        transition(":enter", [
            style({
                opacity: 0,
                transform: "translateY(-1rem)",
            }),
            animate(
                "600ms ease-in",
                style({
                    opacity: 1,
                    transform: "translateY(0)",
                }),
            ),
        ]),
        transition(":leave", [
            style({
                opacity: 1,
                transform: "translateY(0)",
            }),
            animate(
                "0ms ease-in",
                style({
                    opacity: 0,
                    transform: "translateY(-1rem)",
                }),
            ),
        ]),
    ]),
    trigger("flowControl", [
        transition(":enter", [
            style({
                opacity: 0,
                transform: "translateY(-1rem)",
            }),
            animate(
                ".5s .5s ease-out",
                style({
                    opacity: 1,
                    transform: "translateY(0)",
                }),
            ),
        ]),
    ]),
    trigger("fade", [
        transition(":enter", [
            style({
                opacity: 0.3,
            }),
            animate(
                "400ms ease-in",
                style({
                    opacity: 1,
                }),
            ),
        ]),
        transition(":leave", [
            style({
                opacity: 1,
            }),
            animate(
                "0ms ease-in",
                style({
                    opacity: 0,
                }),
            ),
        ]),
    ]),
    trigger("ratingInputFade", [
        state("done", style({opacity: 0, display: 'none'})),
        transition("*=>done", animate('0.5s', style({opacity: 0}))),
    ]),
    trigger("thanksRise", [
        state("done", style({opacity: 1, display: "block"})),
        transition("*=>done", [
            style({display: "block", opacity: 0}),
            animate(".7s .5s", style({opacity: 1}))
        ],)
    ]),
]

@Component({
    templateUrl: "./result-page.component.html",
    styleUrls: ["./result-page.component.scss"],
    animations,
})
export class ResultPageComponent implements OnInit {
    measure?: Measure;
    isMobile: boolean = false;
    rating: number = 0;
    ratingVisible: boolean = false;
    ratingState = '';
    ratingBtnDisabled = false;

    constructor(
        readonly router: Router,
        readonly route: ActivatedRoute,
        readonly breakpointObserver: BreakpointObserver,
        readonly api: PublicApiService,
        readonly testing: TestingService,
        readonly titleService: Title
    ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Результат")
        this.route.queryParams.subscribe((params) => {
            this.api.getMeasure(params["id"]).subscribe((result) => {
                if (result.isError) {
                    this.router.navigate(['error'], {queryParams: {err: result.errorMessage}}).then()
                } else {
                    this.measure = result.responseBody;
                }
            });
        });
        this.api.isAlreadyRated().subscribe(response => {
            this.ratingVisible = !response.isError;
        })
        this.breakpointObserver
            .observe(["(max-width: 768px)"])
            .subscribe((result) => {
                this.isMobile = result.matches;
            });
        // this.testing.clear();
    }

    getChartData(): SpeedChartPoint[][] {
        if (this.testing.isProMode && this.measure?.downloadSpeedChart && this.measure?.uploadSpeedChart) {
            return [this.measure?.downloadSpeedChart, this.measure?.uploadSpeedChart];
        } else if (!this.testing.isProMode && this.measure?.downloadSpeedChartUser && this.measure?.uploadSpeedChartUser) {
            return [this.measure?.downloadSpeedChartUser, this.measure?.uploadSpeedChartUser];
        } else {
            return [[], []];
        }
    }

    getDownloadResult(): TestingResultValues {
        return {
            speed: this.measure?.downloadSpeed?.toFixed(2).toString() ?? "-",
            stability: this.measure?.downloadStability?.toFixed(2).toString() ?? "-",
            loss: this.measure?.downloadLoss?.toFixed(2).toString() ?? "-",
            chartData: [],
            slowSpeed: this.measure?.downloadSpeedUser?.toFixed(2).toString() ?? "-",
            slowChartData: []
        };
    }

    getUploadResult(): TestingResultValues {
        return {
            speed: this.measure?.uploadSpeed?.toFixed(2).toString() ?? "-",
            stability: this.measure?.uploadStability?.toFixed(2).toString() ?? "-",
            loss: this.measure?.uploadLoss?.toFixed(2).toString() ?? "-",
            chartData: [],
            slowSpeed: this.measure?.uploadSpeedUser?.toFixed(2).toString() ?? "-",
            slowChartData: []
        };
    }

    getPing(): string {
        return this.measure?.ping?.toFixed(3).toString() ?? "-";
    }

    getJitter(): string {
        return this.measure?.pingJitter?.toFixed(3).toString() ?? "-";
    }

    sendRating() {
        this.ratingBtnDisabled = true;
        this.ratingState = 'done'
        this.api.putRating(this.rating).subscribe(() => {
            setTimeout(() => this.ratingVisible = false, 2500);
        })
    }
}
