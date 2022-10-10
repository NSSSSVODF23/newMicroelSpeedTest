import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AuthGuard} from "./admin/guards/auth.guard";
import {SigninPageComponent} from "./admin/pages/signin-page/signin-page.component";

const routes: Routes = [
    {
        path: "",
        loadChildren: () =>
            import("./public/public-router/public.module").then(
                (m) => m.PublicModule,
            ),
    },
    {
        path: "admin",
        loadChildren: () =>
            import("./admin/admin-router/admin.module").then((m) => m.AdminModule),
        canActivate: [AuthGuard]
    },
    {
        path: "signin",
        component: SigninPageComponent,
    },
    {path: "**", redirectTo: "", pathMatch: "full"},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
