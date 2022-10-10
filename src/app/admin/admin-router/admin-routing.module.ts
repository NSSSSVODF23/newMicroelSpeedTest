import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {DashboardPageComponent} from "../pages/dashboard-page/dashboard-page.component";
import {DevicesPageComponent} from "../pages/devices-page/devices-page.component";
import {MeasuresPageComponent} from "../pages/measures-page/measures-page.component";
import {MeasurePageComponent} from "../pages/measure-page/measure-page.component";
import {UsersPageComponent} from "../pages/users-page/users-page.component";
import {RootComponent} from "../root/root.component";
import {ComplaintsPageComponent} from "../pages/complaint-page/complaints-page.component";

const routes: Routes = [
    {
        path: "",
        component: RootComponent,
        children: [
            {path: "dashboard", component: DashboardPageComponent},
            {path: "measures", component: MeasuresPageComponent},
            {path: "measure", component: MeasurePageComponent},
            {path: "devices", component: DevicesPageComponent},
            {path: "users", component: UsersPageComponent},
            {path: "complaints", component: ComplaintsPageComponent},
            {path: "", redirectTo: "dashboard", pathMatch: "full"},
        ],
    },
    // {path: "**", redirectTo: "/admin/dashboard", pathMatch: "full"},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {
}
