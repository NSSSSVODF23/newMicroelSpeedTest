import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {MeasurePageGuard} from "../guards/measure-page.guard";
import {IndexPageComponent} from "../pages/index-page/index-page.component";
import {MeasurePageComponent} from "../pages/measure-page/measure-page.component";
import {ResultPageComponent} from "../pages/result-page/result-page.component";
import {RootComponent} from "../root/root.component";
import {ErrorPageComponent} from "../pages/error-page/error-page.component";
import {ComplaintPageComponent} from "../pages/complaint-page/complaint-page.component";
import {RadarPageComponent} from "../pages/radar-page/radar-page.component";
import {RadarGuard} from "../guards/radar.guard";
import {OldMeasuresPageComponent} from "../pages/old-measures-page/old-measures-page.component";

const routes: Routes = [
    {
        path: "",
        component: RootComponent,
        children: [
            {path: "", component: IndexPageComponent},
            {
                path: "measure",
                component: MeasurePageComponent,
                canActivate: [MeasurePageGuard],
            },
            {
                path: "error",
                component: ErrorPageComponent
            },
            {
                path: "result",
                component: ResultPageComponent,
            },
            {
                path: "complaint",
                component: ComplaintPageComponent,
            },
            {
                path: "radar",
                component: RadarPageComponent,
                canActivate: [RadarGuard]
            },
            {
                path: "results",
                component: OldMeasuresPageComponent,
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicRoutingModule {
}
