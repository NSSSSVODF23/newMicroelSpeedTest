import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MeasureService} from "../../service/measure.service";
import {Table} from "primeng/table";
import {HouseService} from "../../service/house.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {MeasurePageable} from "../../../common/class/page-loaders/measure-pageable";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Title} from "@angular/platform-browser";
import {TableQueryLoader} from "../../../common/class/page-loaders/controllers/table-query-loader";
import {ListQueryLoader} from "../../../common/class/page-loaders/controllers/list-query-loader";


@Component({
    templateUrl: "./measures-page.component.html",
    styleUrls: ["./measures-page.component.scss"],
})
export class MeasuresPageComponent implements OnInit, OnDestroy {
    @ViewChild("measureTable") measureTable?: Table;
    tableLoader = new TableQueryLoader(new MeasurePageable(this.measure, this.house), this.router, this.route, ['admin', 'measures']);
    listLoader = new ListQueryLoader(new MeasurePageable(this.measure, this.house), this.router, this.route, ['admin', 'measures']);
    ipInputFilter: RegExp = /^[\d\.]+$/;
    macInputFilter: RegExp = /^[\da-f:]+$/;
    columns = ["Соед.",
        "Дата замера",
        "Логин",
        "Адрес",
        "IP Адрес",
        "MAC Адрес",
        "Скачивание",
        "Загрузка"]
    subscriptions: Subscription[] = [];
    isMobile = false;
    searchVisible = false;

    constructor(
        readonly measure: MeasureService,
        readonly house: HouseService,
        readonly router: Router,
        readonly route: ActivatedRoute,
        readonly breakpoint: BreakpointObserver,
        readonly titleService: Title
    ) {
    }

    get addressName() {
        return this.house.houses.find(h => h.houseId === this.tableLoader.param()['address'])?.address ?? ""
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Замеры")
        this.measure
            .getBeginning()
            .subscribe(data => {
                this.tableLoader.elements = [...data, ...this.tableLoader.elements];
            });
        this.subscriptions.push(
            this.breakpoint.observe('(max-width:1120px)').subscribe(b => {
                this.isMobile = b.matches
                if (!this.isMobile) this.router.navigate(['admin', 'measures'], {
                    queryParams: {limit: '10'},
                    queryParamsHandling: "merge"
                })
            })
        )
    }

    selectMeasure(event: any) {
        if (event && event.measureId) {
            setTimeout(
                () => {
                    this.router.navigate(["/admin/measure"], {
                        queryParams: {id: event.measureId},
                    }).then()
                }, 500
            )
        }
    }

    openSearchPanel() {
        this.searchVisible = true;
    }

    ngOnDestroy(): void {
        this.tableLoader.unsubscribe()
        this.listLoader.unsubscribe()
        this.subscriptions.forEach(s => s.unsubscribe())
        this.subscriptions = [];
    }
}
