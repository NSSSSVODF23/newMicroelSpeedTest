import {Injectable} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "../service/auth.service";

@Injectable({
    providedIn: "root",
})
export class AuthGuard implements CanActivate {
    constructor(readonly router: Router, readonly auth: AuthService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        if (this.auth.isAuth()) {
            console.log(`AuthGuard: authorized`);
            return true;
        } else {
            console.log(`AuthGuard: not authorized`);
            return this.router.createUrlTree(["/signin"]);
        }
    }
}
