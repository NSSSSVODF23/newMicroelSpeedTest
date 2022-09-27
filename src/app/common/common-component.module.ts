import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LabelComponent } from "./components/label/label.component";
import { PingResultValuesPanelComponent } from "./components/ping-result-values-panel/ping-result-values-panel.component";
import { SpeedChartComponent } from "./components/speed-chart/speed-chart.component";
import { SpeedIndicatorComponent } from "./components/speed-indicator/speed-indicator.component";
import { SpeedResultValuesPanelComponent } from "./components/speed-result-values-panel/speed-result-values-panel.component";
import { StartingTestButtonComponent } from "./components/starting-test-button/starting-test-button.component";
import { TopPanelComponent } from "./components/top-panel/top-panel.component";
import { InputErrorMessageComponent } from "./components/input-error-message/input-error-message.component";
import { AvatarModule } from "primeng/avatar";
import { StopPropagationDirective } from './directivies/stop-propagation.directive';

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
	],
	imports: [CommonModule],
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
	],
})
export class CommonComponentModule {}
