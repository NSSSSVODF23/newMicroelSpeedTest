import {Component, OnDestroy, OnInit} from "@angular/core";
import {TestingService} from "../../service/measure/testing.service";
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from "@angular/animations";
import {TestingResultValues} from "src/app/common/class/speed-test-controller";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {BreakpointObserver} from "@angular/cdk/layout";

const fadeInOut = trigger("fade", [
    transition(":enter", [
        style({
            opacity: 0,
            transform: "scale(.9)",
        }),
        animate(
            "400ms ease-in-out",
            style({
                transform: "scale(1)",
                opacity: 1,
            }),
        ),
    ]),
    transition(":leave", [
        style({
            transform: "scale(1)",
            opacity: 1,
        }),
        animate(
            "400ms ease-in-out",
            style({
                opacity: 0,
                transform: "scale(0)",
            }),
        ),
    ]),
]);

const flowInOut = trigger("flow", [
    transition(":enter", [
        style({
            opacity: 0,
            transform: "translateY(1rem)",
        }),
        animate(
            "600ms ease-out",
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
            "600ms ease-out",
            style({
                opacity: 0,
                transform: "translateY(1rem)",
            }),
        ),
    ]),
]);

@Component({
    templateUrl: "./measure-page.component.html",
    styleUrls: ["./measure-page.component.scss"],
    animations: [fadeInOut, flowInOut],
})
export class MeasurePageComponent implements OnInit, OnDestroy {
    isMobile: boolean = false;
    chart: any = [[], []];
    ping = "-";
    jitter = "-";
    downloadResult: TestingResultValues = {
        speed: "-",
        stability: "-",
        loss: "-",
        chartData: [],
        slowSpeed: "-",
        slowChartData: []
    };
    uploadResult: TestingResultValues = {
        speed: "-",
        stability: "-",
        loss: "-",
        chartData: [],
        slowSpeed: "-",
        slowChartData: []
    };
    routeSubscription!: Subscription;
    testType: "download" | "upload" = "download";
    indicatorSpeed = "0.00";
    subscribes: Subscription[] = [];

    constructor(
        readonly service: TestingService,
        readonly router: Router,
        readonly route: ActivatedRoute,
        readonly breakpointObserver: BreakpointObserver,
    ) {
    }

    ngOnInit(): void {
        this.service.sendStart();
        this.subscribes.push(
            this.breakpointObserver
                .observe(["(max-width: 992px)"])
                .subscribe((result) => {
                    if (result.matches) {
                        this.isMobile = true;
                    } else {
                        this.isMobile = false;
                    }
                }),
        );
        this.subscribes.push(
            this.service.downloadTest.getUpdateTest().subscribe({
                next: (result) => {
                    this.chart[0] = this.service.isProMode ? result.chartData : result.slowChartData;
                    this.chart = this.chart.slice();
                    this.testType = "download";
                    this.indicatorSpeed = this.service.isProMode ? result.speed : result.slowSpeed;
                },
                error: err => this.router.navigate([''])
            })
        );

        this.subscribes.push(
            this.service.uploadTest.getUpdateTest().subscribe((result) => {
                this.chart[1] = this.service.isProMode ? result.chartData : result.slowChartData;
                this.chart = this.chart.slice();
                this.testType = "upload";
                this.indicatorSpeed = this.service.isProMode ? result.speed : result.slowSpeed;
            }),
        );
        this.subscribes.push(
            this.service.downloadTest.getFinishTest().subscribe((result) => {
                this.downloadResult = result;
            }),
        );
        this.subscribes.push(
            this.service.uploadTest.getFinishTest().subscribe((result) => {
                this.uploadResult = result;
            }),
        );
        this.subscribes.push(
            this.service.pingTest.getFinishTest().subscribe((result) => {
                this.ping = result.ping;
                this.jitter = result.jitter;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscribes.forEach((subscribe) => subscribe.unsubscribe()); // Отписываемся от всех подписок
        this.subscribes = []; // Очищаем массив подписок
        this.service.stop();
    }
}
