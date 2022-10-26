import {
    animate,
    state,
    style,
    transition,
    trigger,
} from "@angular/animations";
import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {LazyLoadEvent} from "primeng/api";
import {Table} from "primeng/table";
import {SpeedChartComponent} from "src/app/common/components/speed-chart/speed-chart.component";
import {Measure} from "src/app/common/transport/models/measure";
import {MeasureService} from "../../service/measure.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Subscription} from "rxjs";
import {configureMeasurementChart, getLineDataset} from "../../../common/method/chart";
import {PagingLoadService} from "../../../common/class/paging-load-service";
import {MeasurePageable} from "../../../common/class/page-loaders/measure-pageable";
import {ListLoader} from "../../../common/class/page-loaders/controllers/list-loader";
import {HouseService} from "../../service/house.service";

const extendAnimation = trigger("anotherMeasureExtend", [
    state(
        "show",
        style({
            height: "387px",
        }),
    ),
    state(
        "hide",
        style({
            height: "37px",
        }),
    ),
    transition("show <=> hide", [animate(".3s ease-out")]),
]);

@Component({
    templateUrl: "./measure-page.component.html",
    styleUrls: ["./measure-page.component.scss"],
    animations: [extendAnimation],
})
export class MeasurePageComponent implements OnInit, OnDestroy {
    currentMeasure?: Measure;
    anotherLoader = new ListLoader(new MeasurePageable(this.measureService, this.houseService), {})

    anotherMeasureExtend: "show" | "hide" = "hide";

    totalRecords = 0;
    loading = true;

    isMobile = false;

    subscriptions: Subscription[] = [];

    downloadDataset: any = {};
    uploadDataset: any = {};
    downloadDatasetUser: any = {};
    uploadDatasetUser: any = {};

    chartOptions = configureMeasurementChart();

    constructor(
        readonly route: ActivatedRoute,
        readonly router: Router,
        readonly measureService: MeasureService,
        readonly houseService: HouseService,
        readonly breakpoint: BreakpointObserver
    ) {
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const measureId = params["id"];
            if (measureId) {
                this.measureService.getMeasureById(measureId).subscribe((measure) => {
                    this.currentMeasure = measure;
                    this.anotherLoader.load({login: this.currentMeasure.session?.login})
                    this.downloadDataset = getLineDataset("Скачивание", "#37d9e3", this.currentMeasure?.downloadSpeedChart?.map(p => {
                        return {x: p.stamp, y: p.speed}
                    }))
                    this.uploadDataset = getLineDataset("Загрузка", "#ba46f0", this.currentMeasure?.uploadSpeedChart?.map(p => {
                        return {x: p.stamp, y: p.speed}
                    }))
                    this.downloadDatasetUser = getLineDataset("Скачивание (что видит пользователь)", "#3de337", this.currentMeasure?.downloadSpeedChartUser?.map(p => {
                        return {x: p.stamp, y: p.speed}
                    }))
                    this.uploadDatasetUser = getLineDataset("Загрузка (что видит пользователь)", "#466ef0", this.currentMeasure?.uploadSpeedChartUser?.map(p => {
                        return {x: p.stamp, y: p.speed}
                    }))
                    this.downloadDatasetUser.hidden = true;
                    this.uploadDatasetUser.hidden = true;
                });
            }
        });
        this.subscriptions.push(
            this.breakpoint.observe('(max-width:835px)').subscribe(b => this.isMobile = b.matches)
        )
    }

    selectMeasure(event: any): void {
        if (event.measureId) {
            this.router.navigate(["/admin/measure"], {
                queryParams: {
                    id: event.measureId
                },
            }).then();
        }
    }

    changeExtend() {
        if (this.anotherMeasureExtend === "hide") {
            this.anotherMeasureExtend = "show";
        } else {
            this.anotherMeasureExtend = "hide";
        }
    }
}
