import {Injectable} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate, CanActivateChild,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "../service/auth.service";

@Injectable({
    providedIn: "root",
})
export class AuthGuard implements CanActivateChild {
    constructor(readonly router: Router, readonly auth: AuthService) {
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.auth.authObserver.apply(this.auth);
    }
}
