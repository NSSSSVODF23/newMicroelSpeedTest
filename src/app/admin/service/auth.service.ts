import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Apollo } from "apollo-angular";
import jwtDecode from "jwt-decode";
import { AuthResponse } from "src/app/common/transport/models/auth";

@Injectable({
	providedIn: "root",
})
export class AuthService {
	private token: string | null = null;
	private refreshToken: string | null = null;
	private updateObserver = new UpdateTokenObserver();
	public readonly isAuth = () => {
		return this.token !== null && this.token !== undefined && this.token !== "";
	};

	constructor(readonly http: HttpClient, readonly router: Router) {
		this.loadTokens();
		this.updateObserver.startObserve(this);
	}

	public getUsername(): string | null {
		if (this.token) {
			const decode = JSON.parse(atob(this.token.split(".")[1]));
			return decode.sub;
		}
		return null;
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

	public doLogin(
		username: string,
		password: string,
		callback: (authorized: boolean) => void,
	) {
		// Записать ответ в поля объекта
		this.http
			.post<AuthResponse>(`http://${location.hostname}:8080/public/login`, {
				username,
				password,
			})
			.subscribe({
				next: (response) => {
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
		this.router.navigate(["/signin"]);
	}

	public doRefreshToken(callback: (authorized: boolean) => void) {
		console.log("Refresh token");
		this.http
			.post<AuthResponse>(`http://${location.hostname}:8080/public/token`, {
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
}

class UpdateTokenObserver {
	constructor() {}

	public startObserve(auth: AuthService) {
		setInterval(() => {
			const token = auth.getToken();
			if (token) {
				const decoded: any = jwtDecode(token);
				const currentTime = Date.now();
				const expiresIn = decoded.exp * 1000;
				const deltaTime = (expiresIn - currentTime) / 1000;
				if (deltaTime < 10) {
					auth.doRefreshToken(() => {});
				}
			}
		}, 1000);
	}
}
