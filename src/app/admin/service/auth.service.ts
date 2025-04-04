import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {ActivationEnd, NavigationStart, Router} from "@angular/router";
import {Apollo} from "apollo-angular";
import jwtDecode from "jwt-decode";
import {AuthResponse} from "src/app/common/transport/models/auth";
import {decodeJWT} from "../../common/method/object";
import {endpointHttp} from "../../api-endpoint";
import {catchError, of, switchMap, tap} from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private token: string | null = null;
    private refreshToken: string | null = null;
    private updateObserver = new UpdateTokenObserver();

    constructor(readonly http: HttpClient, readonly router: Router) {
        this.loadTokens()
        this.updateObserver.startObserve(this);
    }

    public hasRefresh(): boolean {
        return typeof this.refreshToken === "string"
    }

    public isAuth() {
        return this.token !== null && this.token !== undefined && this.token !== "";
    };

    public authObserver() {
        return this.http
            .post<AuthResponse>(`${endpointHttp}/public/token`, {
                refreshToken: this.refreshToken,
            }).pipe(tap({
                    next: (response) => {
                        this.saveTokens(response.token, this.refreshToken);
                    },
                    error: (error) => {
                        console.log(error)
                        this.saveTokens(null, null);
                    },
                }),
                switchMap((value, index) => of(true)
                ),
                catchError(() => of(this.router.createUrlTree(["/signin"])))
            )
    }

    public getUsername(): string | null {
        if (this.token) {
            const decode = decodeJWT(this.token);
            return decode.sub;
        }
        return null;
    }

    public getRole(): number {
        if (this.token) {
            const decode = decodeJWT(this.token);
            return decode.role;
        }
        return 999;
    }

    public isAdmin(): boolean {
        return this.getRole() < 2;
    }

    public doLogin(
        username: string,
        password: string,
        callback: (authorized: boolean) => void,
    ) {
        // Записать ответ в поля объекта
        this.http
            .post<AuthResponse>(`${endpointHttp}/public/login`, {
                username,
                password,
            })
            .subscribe({
                next: (response) => {
                    console.log('login', response)
                    this.saveTokens(response.token, response.refreshToken);
                },
                error: (error) => {
                    this.saveTokens(null, null);
                    callback(false);
                },
                complete: () => {
                    callback(true);
                },
            });
    }

    public doLogout() {
        this.saveTokens(null, null);
        this.router.navigate(["/signin"]).then();
    }

    public doRefreshToken(callback: (authorized: boolean) => void) {
        console.log("Refresh token");
        this.http
            .post<AuthResponse>(`${endpointHttp}/public/token`, {
                refreshToken: this.refreshToken,
            })
            .subscribe({
                next: (response) => {
                    console.log(`New token: ${response.token}`);
                    this.saveTokens(response.token, this.refreshToken);
                },
                error: (error) => {
                    this.saveTokens(null, null);
                    callback(false);
                },
                complete: () => {
                    callback(true);
                },
            });
    }

    public getToken() {
        return this.token;
    }

    private saveTokens(token: string | null, refreshToken: string | null) {
        this.token = token;
        this.refreshToken = refreshToken;
        if (this.token && this.refreshToken) {
            localStorage.setItem("token", this.token);
            localStorage.setItem("refreshToken", this.refreshToken);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
        }
    }

    private loadTokens() {
        this.token = localStorage.getItem("token");
        this.refreshToken = localStorage.getItem("refreshToken");
    }
}

class UpdateTokenObserver {
    constructor() {
    }

    public startObserve(auth: AuthService) {
        setInterval(() => {
            const token = auth.getToken();
            if (token) {
                const decoded: any = jwtDecode(token);
                const currentTime = Date.now();
                if (!decoded.exp) {
                    auth.doRefreshToken(() => {
                    })
                    return;
                }
                const expiresIn = decoded.exp * 1000;
                const deltaTime = (expiresIn - currentTime) / 1000;
                if (deltaTime < 10) {
                    auth.doRefreshToken(() => {
                    });
                }
            } else if (auth.hasRefresh()) {
                auth.doRefreshToken(() => {
                })
            }
        }, 1000);
    }
}
