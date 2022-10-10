import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AdminTopPanelComponent} from "./admin-top-panel/admin-top-panel.component";
import {ButtonModule} from "primeng/button";
import {AdminLinksMenuComponent} from "./admin-links-menu/admin-links-menu.component";
import {RouterModule} from "@angular/router";
import {UserAvatarComponent} from "./user-avatar/user-avatar.component";
import {AvatarModule} from "primeng/avatar";
import {StatisticCardComponent} from "./statistic-card/statistic-card.component";
import {CardModule} from "primeng/card";
import {SidebarModule} from "primeng/sidebar";
import {AdminModule} from "../admin-router/admin.module";
import {AccountPanelComponent} from "./user-panel/account-panel.component";
import {LazyTableComponent} from './lazy-table/lazy-table.component';
import {TableModule} from "primeng/table";
import {SkeletonModule} from "primeng/skeleton";
import {LazyListComponent} from './lazy-list/lazy-list.component';
import {VirtualScrollerModule} from "primeng/virtualscroller";
import {FilterChipsComponent} from './filter-chips/filter-chips.component';
import {ChipModule} from "primeng/chip";
import {CommonComponentModule} from "../../common/common-component.module";
import {DialogModule} from "primeng/dialog";
import {ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {PasswordModule} from "primeng/password";
import {InputTextModule} from "primeng/inputtext";

@NgModule({
    declarations: [
        AdminTopPanelComponent,
        AdminLinksMenuComponent,
        UserAvatarComponent,
        StatisticCardComponent,
        AccountPanelComponent,
        LazyTableComponent,
        LazyListComponent,
        FilterChipsComponent
    ],
    imports: [CommonModule, ButtonModule, RouterModule, AvatarModule, CardModule, SidebarModule, TableModule, SkeletonModule, VirtualScrollerModule, ChipModule, CommonComponentModule, DialogModule, ReactiveFormsModule, DropdownModule, PasswordModule, InputTextModule],
    exports: [
        AdminTopPanelComponent,
        UserAvatarComponent,
        AdminLinksMenuComponent,
        StatisticCardComponent,
        AccountPanelComponent,
        LazyTableComponent,
        LazyListComponent,
        FilterChipsComponent
    ],
})
export class AdminComponentsModule {
}
