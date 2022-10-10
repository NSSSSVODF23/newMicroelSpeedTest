import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, tap} from 'rxjs';
import {TestingService} from "../service/testing.service";
import {PublicApiService} from "../service/public-api.service";

@Injectable({
    providedIn: 'root'
})
export class RadarGuard implements CanActivate {

    constructor(readonly router: Router, readonly api: PublicApiService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.api.isPro().pipe(tap(v => {
            if (!v) this.router.navigate(['/']).then()
        }))
    }
}
