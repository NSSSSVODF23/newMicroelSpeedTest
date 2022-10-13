import {Component, OnDestroy, OnInit} from "@angular/core";
import {TestingService} from "../../service/testing.service";
import {animate, style, transition, trigger,} from "@angular/animations";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MeasureActionTypes} from "../../../common/transport/models/measure-action-message";
import {Title} from "@angular/platform-browser";

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

    downloadSpeed = "-";
    downloadStability = "-";
    downloadLoss = "-";

    uploadSpeed = "-";
    uploadStability = "-";
    uploadLoss = "-";

    indicatorSpeed = "0.00";

    testType: "download" | "upload" = "download";
    subscribes: Subscription[] = [];

    constructor(
        readonly service: TestingService,
        readonly router: Router,
        readonly route: ActivatedRoute,
        readonly breakpointObserver: BreakpointObserver,
        readonly titleService: Title
    ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle("Тестирование...")
        this.service.pingTest.getObserver().subscribe({
            next: () => {
                this.ping = this.service.pingTest.pingValue.toFixed(3);
                this.jitter = this.service.pingTest.jitterValue.toFixed(3);
            }
        })
        this.service.downloadTest.getObserver().subscribe({
            next: () => {
                this.chart = this.service.isProMode ? [this.service.downloadTest.chartData, this.service.uploadTest.chartData] : [this.service.downloadTest.slowChartData, this.service.uploadTest.slowChartData]
                this.indicatorSpeed = this.service.isProMode ? this.service.downloadTest.currentValue.toFixed(2) : this.service.downloadTest.slowCurrentValue.toFixed(2);
            },
            complete: () => {
                this.downloadSpeed = this.service.isProMode ? this.service.downloadTest.currentValue.toFixed(2) : this.service.downloadTest.slowCurrentValue.toFixed(2);
                this.downloadStability = this.service.downloadTest.stability.toFixed(2);
                this.downloadLoss = this.service.downloadTest.percentLoss.toFixed(2);
                this.testType = "upload";
                this.indicatorSpeed = "0.00";
            }
        })
        this.service.uploadTest.getObserver().subscribe({
            next: () => {
                this.chart = this.service.isProMode ? [this.service.downloadTest.chartData, this.service.uploadTest.chartData] : [this.service.downloadTest.slowChartData, this.service.uploadTest.slowChartData]
                this.indicatorSpeed = this.service.isProMode ? this.service.uploadTest.currentValue.toFixed(2) : this.service.uploadTest.slowCurrentValue.toFixed(2);
            },
            complete: () => {
                this.uploadSpeed = this.service.isProMode ? this.service.uploadTest.currentValue.toFixed(2) : this.service.uploadTest.slowCurrentValue.toFixed(2);
                this.uploadStability = this.service.uploadTest.stability.toFixed(2);
                this.uploadLoss = this.service.uploadTest.percentLoss.toFixed(2);
            }
        })

        this.service.sendStart();
        this.subscribes.push(
            this.breakpointObserver
                .observe(["(max-width: 992px)"])
                .subscribe((result) => {
                    this.isMobile = result.matches;
                }),
        );
    }

    ngOnDestroy(): void {
        if (!this.service.uploadTest.isEnded()) this.service.measureSocket.next({
            type: MeasureActionTypes.ABORT,
            deviceInfo: this.service.deviceInfo.getDeviceInfo()
        })
        this.subscribes.forEach((subscribe) => subscribe.unsubscribe()); // Отписываемся от всех подписок
        this.subscribes = []; // Очищаем массив подписок
        this.service.clear()
    }
}
