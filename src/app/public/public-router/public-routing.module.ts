import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MeasurePageGuard } from "../guards/measure-page.guard";
import { IndexPageComponent } from "../pages/index-page/index-page.component";
import { MeasurePageComponent } from "../pages/measure-page/measure-page.component";
import { ResultPageComponent } from "../pages/result-page/result-page.component";
import { RootComponent } from "../root/root.component";

const routes: Routes = [
	{
		path: "",
		component: RootComponent,
		children: [
			{ path: "", component: IndexPageComponent },
			{
				path: "measure",
				component: MeasurePageComponent,
				canActivate: [MeasurePageGuard],
			},
			{
				path: "result",
				component: ResultPageComponent,
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PublicRoutingModule {}
