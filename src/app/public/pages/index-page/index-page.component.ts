import {
	AfterContentChecked,
	AfterContentInit,
	AfterViewChecked,
	AfterViewInit,
	Component,
	DoCheck,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
} from "@angular/core";
import { DeviceInfoService } from "src/app/common/service/device-info.service";
import { TestingService } from "../../service/measure/testing.service";

@Component({
	templateUrl: "./index-page.component.html",
	styleUrls: ["./index-page.component.scss"],
})
export class IndexPageComponent
	implements
		OnInit
{
	isMobile: boolean = false;

	constructor(
		readonly device: DeviceInfoService,
		readonly measure: TestingService,
	) {}

	ngOnInit(): void {
		console.log("IndexPageComponent.ngOnInit");
		this.measure.sendPrepare(); // Отправляем предварительный запрос на сервер для получения информации о пользователе
		this.isMobile = this.device.isMobile; // Это мобильное устройство?

		// setInterval(() => {
		// 	const request = new XMLHttpRequest();
		// 	request.open(
		// 		"POST",
		// 		`http://${location.hostname}:8080/upload?deviceId=test`,
		// 		true,
		// 	);
		// 	request.send(
		// 		new Blob([new ArrayBuffer(50)], {
		// 			type: "application/octet-stream",
		// 		}),
		// 	);
		// }, 1000);
	}
}
