import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AdminRoutingModule } from "./admin-routing.module";
import { RootComponent } from "../root/root.component";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { IndexPageComponent } from "../pages/index-page/index-page.component";
import { CommonComponentModule } from "src/app/common/common-component.module";
import { AdminComponentsModule } from "../components/admin-components.module";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { FormsModule, FormControl, ReactiveFormsModule } from "@angular/forms";
import { InputMaskModule } from "primeng/inputmask";
import { KeyFilterModule } from "primeng/keyfilter";
import { TabViewModule } from "primeng/tabview";
import { FieldsetModule } from "primeng/fieldset";
import { DialogModule } from "primeng/dialog";
import { AvatarModule } from "primeng/avatar";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { FileUploadModule } from "primeng/fileupload";
import { SkeletonModule } from "primeng/skeleton";
import { MeasurePageComponent } from "../pages/measure-page/measure-page.component";
import { DevicesPageComponent } from "../pages/devices-page/devices-page.component";
import { UsersPageComponent } from "../pages/users-page/users-page.component";
import { VirtualScrollerModule } from "primeng/virtualscroller";
import { TieredMenuModule } from "primeng/tieredmenu";
import { MegaMenuModule } from "primeng/megamenu";
import { MessageService } from "primeng/api";
import { NgxImageCompressService } from "ngx-image-compress";
import { DeviceTypePipe } from "../pipes/device-type.pipe";
import { ConnectionTypePipe } from "../pipes/connection-type.pipe";
import { DashboardPageComponent } from "../pages/dashboard-page/dashboard-page.component";
import { ChartModule } from "primeng/chart";

@NgModule({
	declarations: [
		RootComponent,
		IndexPageComponent,
		MeasurePageComponent,
		DevicesPageComponent,
		UsersPageComponent,
		DashboardPageComponent,
		DeviceTypePipe,
		ConnectionTypePipe,
	],
	imports: [
		CommonModule,
		AdminRoutingModule,
		CommonComponentModule,
		InputTextModule,
		PasswordModule,
		AdminComponentsModule,
		TableModule,
		CardModule,
		ButtonModule,
		InputTextModule,
		InputMaskModule,
		KeyFilterModule,
		DropdownModule,
		CalendarModule,
		FormsModule,
		TabViewModule,
		FieldsetModule,
		DialogModule,
		VirtualScrollerModule,
		AvatarModule,
		ReactiveFormsModule,
		ToastModule,
		ConfirmDialogModule,
		FileUploadModule,
		SkeletonModule,
		ChartModule,
		TabViewModule,
		TieredMenuModule,
		MegaMenuModule,
	],
	providers: [MessageService, ConfirmationService, NgxImageCompressService],
})
export class AdminModule {}
