import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from "@angular/router";
import { catchError, first, map, Observable } from "rxjs";
import { DeviceInfoService } from "src/app/common/service/device-info.service";
import { TestingStage } from "src/app/common/transport/enums/testing-stage";
import { TestingService } from "../service/measure/testing.service";

/**
 * Не дает перейти на страницу измерения, пользователь просто обновил страницу,
 * или пытается перейти на эту страницу из адресной строки.
 * Защита считывает поле **testStage** из **MeasureService** и если
 * оно не равно PREPARE **не дает** перейти на страницу тестирования.
 */
@Injectable({
	providedIn: "root",
})
export class MeasurePageGuard implements CanActivate {
	constructor(
		readonly measure: TestingService,
		readonly router: Router,
		readonly http: HttpClient,
		readonly device: DeviceInfoService,
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	):
		| Observable<boolean | UrlTree>
		| Promise<boolean | UrlTree>
		| boolean
		| UrlTree {
		return this.http
			.post(
				`http://${location.hostname}:8080/public/check?deviceId=${this.device.deviceId}`,
				{},
			)
			.pipe(
				map((accepted) => {
					if (accepted) {
						return true;
					} else {
						return this.router.createUrlTree(["/"]);
					}
				}),
			);
	}
}
