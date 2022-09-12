import { Component, OnInit } from "@angular/core";
import { User } from "src/app/common/transport/models/user";
import { AuthService } from "../../service/auth.service";
import { UserService } from "../../service/user.service";

@Component({
	selector: "app-admin-top-panel",
	templateUrl: "./admin-top-panel.component.html",
	styleUrls: ["./admin-top-panel.component.scss"],
})
export class AdminTopPanelComponent implements OnInit {
	currentUser?: User;

	constructor(readonly auth: AuthService, readonly user: UserService) {}

	ngOnInit(): void {
		const username = this.auth.getUsername();
		if (username)
			this.user.getUserByUsername(username).subscribe((data) => {
				this.currentUser = data;
			});
	}
}
