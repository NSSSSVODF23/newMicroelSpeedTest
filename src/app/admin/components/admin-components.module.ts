import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminTopPanelComponent } from "./admin-top-panel/admin-top-panel.component";
import { ButtonModule } from "primeng/button";
import { AdminLinksMenuComponent } from "./admin-links-menu/admin-links-menu.component";
import { RouterModule } from "@angular/router";
import { UserAvatarComponent } from "./user-avatar/user-avatar.component";
import { AvatarModule } from "primeng/avatar";
import { StatisticCardComponent } from "./statistic-card/statistic-card.component";
import { CardModule } from "primeng/card";

@NgModule({
	declarations: [
		AdminTopPanelComponent,
		AdminLinksMenuComponent,
		UserAvatarComponent,
		StatisticCardComponent,
	],
	imports: [CommonModule, ButtonModule, RouterModule, AvatarModule, CardModule],
	exports: [
		AdminTopPanelComponent,
		UserAvatarComponent,
		AdminLinksMenuComponent,
		StatisticCardComponent,
	],
})
export class AdminComponentsModule {}
