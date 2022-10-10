import {Component, OnDestroy, OnInit} from "@angular/core";
import {Device} from "src/app/common/service/device-info.service";
import {DeviceService} from "../../service/device.service";
import {
    Subscription,
} from "rxjs";
import {HouseService} from "../../service/house.service";
import {ActivatedRoute, Router} from "@angular/router";
import {idSorting, updateListResolver} from "../../../common/method/update_resolver";
import {PagingLoadService} from "../../../common/class/paging-load-service";
import {DevicePageable} from "../../../common/class/page-loaders/device-pageable";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Title} from "@angular/platform-browser";
import {TableQueryLoader} from "../../../common/class/page-loaders/controllers/table-query-loader";
import {ListQueryLoader} from "../../../common/class/page-loaders/controllers/list-query-loader";

@Component({
    templateUrl: "./devices-page.component.html",
    styleUrls: ["./devices-page.component.scss"],
})
export class DevicesPageComponent implements OnInit, OnDestroy {
    ipInputFilter: RegExp = /^[\d\.]+$/;
    subscriptions: Subscription[] = [];
    tableLoader = new TableQueryLoader<Device>(new DevicePageable(this.device, this.house), this.router, this.route, ['admin', 'devices'])
    listLoader = new ListQueryLoader<Device>(new DevicePageable(this.device, this.house), this.router, this.route, ['admin', 'devices']);

    isMobile = false;
    searchVisible = false;

    columns = [
        "Тип",
        "ID Устройства",
        "IP Адрес",
        "Hostname",
        "Система",
        "Платформа",
        "Сред. скачивание",
        "Сред. загрузка",
        "Кол. замеров",
        "Режим pro"
    ]

    constructor(
        readonly device: DeviceService,
        readonly house: HouseService,
        readonly router: Router,
        readonly route: ActivatedRoute,
        readonly breakpoint: BreakpointObserver,
        readonly titleService: Title
    ) {
    }

    ngOnDestroy(): void {
        this.tableLoader.unsubscribe();
        this.listLoader.unsubscribe();
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Устройства")
        this.subscriptions.push(
            this.breakpoint.observe('(max-width:1270px)').subscribe(b => {
                this.isMobile = b.matches
                if (!this.isMobile) this.router.navigate(['admin', 'devices'], {
                    queryParams: {limit: '10'},
                    queryParamsHandling: "merge"
                })
            })
        )
    }

    openLastMeasure(event: any) {
        const lastMeasureId = idSorting(event.data.measures, "measureId", "desc")[0]?.measureId;
        if (lastMeasureId) {
            this.router.navigate(["admin/measure"], {
                queryParams: {id: lastMeasureId},
            }).then();
        }
    }

    openSearchPanel() {
        this.searchVisible = true;
    }

    setDeviceMode(deviceId: string, event: any) {
        this.device.setDeviceMode(deviceId, event);
    }
}
