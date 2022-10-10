import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {PublicRoutingModule} from "./public-routing.module";
import {IndexPageComponent} from "../pages/index-page/index-page.component";
import {
    StartingTestButtonComponent
} from "src/app/common/components/starting-test-button/starting-test-button.component";
import {RootComponent} from "../root/root.component";
import {MeasurePageComponent} from "../pages/measure-page/measure-page.component";
import {SpeedChartComponent} from "src/app/common/components/speed-chart/speed-chart.component";
import {TestingService} from "../service/testing.service";
import {DeviceInfoService} from "src/app/common/service/device-info.service";
import {MeasurePageGuard} from "../guards/measure-page.guard";
import {LabelComponent} from "src/app/common/components/label/label.component";
import {ButtonModule} from "primeng/button";
import {CardModule} from "primeng/card";
import {DividerModule} from "primeng/divider";
import {
    SpeedResultValuesPanelComponent
} from "src/app/common/components/speed-result-values-panel/speed-result-values-panel.component";
import {
    PingResultValuesPanelComponent
} from "src/app/common/components/ping-result-values-panel/ping-result-values-panel.component";
import {SpeedIndicatorComponent} from "src/app/common/components/speed-indicator/speed-indicator.component";
import {ResultPageComponent} from "../pages/result-page/result-page.component";
import {CommonComponentModule} from "src/app/common/common-component.module";
import {ErrorPageComponent} from '../pages/error-page/error-page.component';
import {RippleModule} from "primeng/ripple";
import {MessagesModule} from "primeng/messages";
import {ComplaintPageComponent} from '../pages/complaint-page/complaint-page.component';
import {RatingModule} from "primeng/rating";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {InputMaskModule} from "primeng/inputmask";
import {CaptchaModule} from "primeng/captcha";
import {MessageModule} from "primeng/message";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {RadarPageComponent} from '../pages/radar-page/radar-page.component';
import {AdminModule} from "../../admin/admin-router/admin.module";
import {ToastModule} from "primeng/toast";

@NgModule({
    declarations: [
        RootComponent,
        IndexPageComponent,
        MeasurePageComponent,
        ResultPageComponent,
        ErrorPageComponent,
        ComplaintPageComponent,
        RadarPageComponent,
    ],
    imports: [
        CommonModule,
        PublicRoutingModule,
        ButtonModule,
        CardModule,
        DividerModule,
        CommonComponentModule,
        RippleModule,
        MessagesModule,
        RatingModule,
        FormsModule,
        InputTextModule,
        InputTextareaModule,
        InputMaskModule,
        CaptchaModule,
        ReactiveFormsModule,
        MessageModule,
        ProgressSpinnerModule,
        AdminModule,
        ToastModule
    ],
    providers: [TestingService, DeviceInfoService, MeasurePageGuard],
})
export class PublicModule {
}
