import {Component, OnDestroy, OnInit} from "@angular/core";
import {LazyLoadEvent} from "primeng/api";
import {Device} from "src/app/common/service/device-info.service";
import {DeviceFilter} from "src/app/common/transport/filters/device-filter";
import {DeviceService} from "../../service/device.service";
import {
    debounceTime,
    distinctUntilChanged,
    Subject,
    Subscription,
} from "rxjs";
import {House} from "src/app/common/transport/models/house";
import {HouseService} from "../../service/house.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SearchObserver} from "../../../common/observers/search_observer";
import {stringToInt} from "../../../common/method/math";
import {idSorting, updateListResolver} from "../../../common/method/update_resolver";
import {QueryLimit} from "../../../common/transport/models/query-limit";
import {deepCopy} from "../../../common/method/object";
import {ListService} from "../../../common/class/list-service";
import {DevicePageLoader} from "../../../common/class/page-loaders/device-page-loader";

@Component({
    templateUrl: "./devices-page.component.html",
    styleUrls: ["./devices-page.component.scss"],
})
export class DevicesPageComponent implements OnInit, OnDestroy {
    selectedMeasure!: Device;
    houseList: House[] = [];
    ipInputFilter: RegExp = /^[\d\.]+$/;
    subscriptions: Subscription[] = [];
    pageLoader: ListService<Device> = new ListService<Device>(new DevicePageLoader(this.device), this.router, this.route, ['admin', 'devices'])

    constructor(
        readonly device: DeviceService,
        readonly house: HouseService,
        readonly router: Router,
        readonly route: ActivatedRoute
    ) {
    }

    ngOnDestroy(): void {
        this.pageLoader.unsubscribe();
    }

    ngOnInit(): void {
        this.house.getAllHouses().subscribe((houses) => {
            this.houseList = [
                {address: "Все дома", houseId: undefined, vlan: 0},
                ...houses.data?.getAllHouses,
            ];
        });
    }

    openLastMeasure(event: any) {
        const lastMeasureId = idSorting(event.data.measures, "measureId", "desc")[0]?.measureId;
        if (lastMeasureId) {
            this.router.navigate(["admin/measure"], {
                queryParams: {id: lastMeasureId},
            }).then();
        }
    }

    setDeviceMode(deviceId: string, event: any) {
        this.device.setDeviceMode(deviceId, event);
    }
}
