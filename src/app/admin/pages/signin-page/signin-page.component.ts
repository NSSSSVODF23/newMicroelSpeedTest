import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { AuthService } from "../../service/auth.service";

@Component({
	templateUrl: "./signin-page.component.html",
	styleUrls: ["./signin-page.component.scss"],
	providers: [MessageService],
})
export class SigninPageComponent implements OnInit {
	loginForm = new FormGroup({
		username: new FormControl("", Validators.required),
		password: new FormControl("", Validators.required),
	});

	constructor(
		readonly auth: AuthService,
		readonly router: Router,
		readonly toast: MessageService,
	) {}

	ngOnInit(): void {}

	onSubmit() {
		this.loginForm.markAllAsTouched();
		if (!this.loginForm.valid) return;
		this.auth.doLogin(
			this.loginForm.value.username,
			this.loginForm.value.password,
			(isSuccessfully) => {
				if (isSuccessfully) {
					this.router.navigate(["/admin"]);
				} else {
					this.toast.add({
						severity: "error",
						summary: "Ошибка",
						detail: "Неверный логин или пароль",
					});
				}
			},
		);
	}
}
