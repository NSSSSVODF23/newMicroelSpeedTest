import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PublicRoutingModule } from "./public-routing.module";
import { IndexPageComponent } from "../pages/index-page/index-page.component";
import { StartingTestButtonComponent } from "src/app/common/components/starting-test-button/starting-test-button.component";
import { RootComponent } from "../root/root.component";
import { MeasurePageComponent } from "../pages/measure-page/measure-page.component";
import { SpeedChartComponent } from "src/app/common/components/speed-chart/speed-chart.component";
import { TestingService } from "../service/measure/testing.service";
import { DeviceInfoService } from "src/app/common/service/device-info.service";
import { MeasurePageGuard } from "../guards/measure-page.guard";
import { LabelComponent } from "src/app/common/components/label/label.component";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { SpeedResultValuesPanelComponent } from "src/app/common/components/speed-result-values-panel/speed-result-values-panel.component";
import { PingResultValuesPanelComponent } from "src/app/common/components/ping-result-values-panel/ping-result-values-panel.component";
import { SpeedIndicatorComponent } from "src/app/common/components/speed-indicator/speed-indicator.component";
import { ResultPageComponent } from "../pages/result-page/result-page.component";
import { CommonComponentModule } from "src/app/common/common-component.module";

@NgModule({
	declarations: [
		RootComponent,
		IndexPageComponent,
		MeasurePageComponent,
		ResultPageComponent,
	],
	imports: [
		CommonModule,
		PublicRoutingModule,
		ButtonModule,
		CardModule,
		DividerModule,
		CommonComponentModule
	],
	providers: [TestingService, DeviceInfoService, MeasurePageGuard],
})
export class PublicModule {}
