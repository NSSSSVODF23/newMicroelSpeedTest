import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardPageComponent } from "../pages/dashboard-page/dashboard-page.component";
import { DevicesPageComponent } from "../pages/devices-page/devices-page.component";
import { IndexPageComponent } from "../pages/index-page/index-page.component";
import { MeasurePageComponent } from "../pages/measure-page/measure-page.component";
import { UsersPageComponent } from "../pages/users-page/users-page.component";
import { RootComponent } from "../root/root.component";

const routes: Routes = [
	{
		path: "",
		component: RootComponent,
		children: [
			{ path: "", redirectTo: "measures", pathMatch: "full" },
			{ path: "dashboard", component: DashboardPageComponent },
			{ path: "measures", component: IndexPageComponent },
			{ path: "measure", component: MeasurePageComponent },
			{ path: "devices", component: DevicesPageComponent },
			{ path: "users", component: UsersPageComponent },
		],
	},
	{ path: "**", redirectTo: "/admin/measures", pathMatch: "full" },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdminRoutingModule {}
