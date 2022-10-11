import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import {catchError, first, iif, map, Observable} from "rxjs";
import {DeviceInfoService} from "src/app/common/service/device-info.service";
import {TestingStage} from "src/app/common/transport/enums/testing-stage";
import {TestingService} from "../service/testing.service";
import {PublicApiService} from "../service/public-api.service";
import {MessageService} from "primeng/api";

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
        readonly testingService: TestingService,
        readonly router: Router,
        readonly http: HttpClient,
        readonly device: DeviceInfoService,
        readonly api: PublicApiService,
        readonly messageService: MessageService
    ) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return this.api.isAlreadyRunning().pipe(map(r => {
            if (r.isError || !this.testingService.isSocketOpen) {
                if (r.isError) this.messageService.add({
                    key: "msg",
                    severity: "warn",
                    life: 10000,
                    detail: "На одном из ваших устройств уже происходит тестирование, дождитесь его окончания."
                })
                return this.router.createUrlTree(["/"]);
            } else {
                return true;
            }
            // if (this.testingService.isSocketOpen) return this.testingService.isSocketOpen; else return this.router.createUrlTree(["/"]);
        }))
    }
}
