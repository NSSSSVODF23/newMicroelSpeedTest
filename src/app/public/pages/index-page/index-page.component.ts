import {Component, OnInit,} from "@angular/core";
import {DeviceInfoService} from "src/app/common/service/device-info.service";
import {TestingService} from "../../service/testing.service";
import {Title} from "@angular/platform-browser";
import {PublicApiService} from "../../service/public-api.service";

@Component({
    templateUrl: "./index-page.component.html",
    styleUrls: ["./index-page.component.scss"],
})
export class IndexPageComponent implements OnInit {
    isMobile: boolean = false;

    constructor(
        readonly deviceInfoService: DeviceInfoService,
        readonly testingService: TestingService,
        readonly titleService: Title,
        readonly api: PublicApiService
    ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР")
        this.isMobile = this.deviceInfoService.isMobile; // Это мобильное устройство?
    }
}
