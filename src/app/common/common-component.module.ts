import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {LabelComponent} from "./components/label/label.component";
import {PingResultValuesPanelComponent} from "./components/ping-result-values-panel/ping-result-values-panel.component";
import {SpeedChartComponent} from "./components/speed-chart/speed-chart.component";
import {SpeedIndicatorComponent} from "./components/speed-indicator/speed-indicator.component";
import {
    SpeedResultValuesPanelComponent
} from "./components/speed-result-values-panel/speed-result-values-panel.component";
import {StartingTestButtonComponent} from "./components/starting-test-button/starting-test-button.component";
import {TopPanelComponent} from "./components/top-panel/top-panel.component";
import {InputErrorMessageComponent} from "./components/input-error-message/input-error-message.component";
import {AvatarModule} from "primeng/avatar";
import {StopPropagationDirective} from './directivies/stop-propagation.directive';
import {RippleModule} from "primeng/ripple";
import {HScrollDirective} from './directivies/h-scroll.directive';
import {TooltipTouchDirective} from './directivies/tooltip-touch.directive';
import {RouterModule} from "@angular/router";
import {ButtonModule} from "primeng/button";

@NgModule({
    declarations: [
        LabelComponent,
        PingResultValuesPanelComponent,
        SpeedChartComponent,
        SpeedIndicatorComponent,
        SpeedResultValuesPanelComponent,
        StartingTestButtonComponent,
        TopPanelComponent,
        InputErrorMessageComponent,
        StopPropagationDirective,
        HScrollDirective,
        TooltipTouchDirective,
    ],
    imports: [CommonModule, RippleModule, RouterModule, ButtonModule],
    exports: [
        LabelComponent,
        PingResultValuesPanelComponent,
        SpeedChartComponent,
        SpeedIndicatorComponent,
        SpeedResultValuesPanelComponent,
        StartingTestButtonComponent,
        TopPanelComponent,
        InputErrorMessageComponent,
        StopPropagationDirective,
        HScrollDirective,
        TooltipTouchDirective,
    ],
})
export class CommonComponentModule {
}
