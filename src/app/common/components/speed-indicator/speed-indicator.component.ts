import {
	animate,
	state,
	style,
	transition,
	trigger,
} from "@angular/animations";
import {
	AfterContentInit,
	AfterViewChecked,
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnInit,
	ViewChild,
} from "@angular/core";
import { Subscription } from "rxjs";
import { TestingService } from "src/app/public/service/measure/testing.service";
import { TestingResultValues } from "../../class/speed-test-controller";

const testTypeAnimationTrigger = trigger("testType", [
	state(
		"download",
		style({
			borderColor: "#37d9e3 #37d9e3 #b2bec3 #b2bec3",
		}),
	),
	state(
		"upload",
		style({
			borderColor: "#ba46f0 #ba46f0 #b2bec3 #b2bec3",
		}),
	),
	transition("download => upload", [animate("1s ease-in")]),
]);

@Component({
	selector: "app-speed-indicator",
	templateUrl: "./speed-indicator.component.html",
	styleUrls: ["./speed-indicator.component.scss"],
	animations: [testTypeAnimationTrigger],
})
export class SpeedIndicatorComponent implements AfterViewInit {
	@ViewChild("indicator") indicator!: ElementRef<HTMLDivElement>;

	value: string = "0.00";
	@Input() set speed(speed: string) {
		this.updateIndicator(speed);
	}
	maxSpeed: number = 100;
	@Input() testType: "download" | "upload" = "download";

	updateIndicator(speed: string) {
		if (!this.indicator) return;
		this.value = speed;
		const speedFloat =
			parseFloat(speed) <= this.maxSpeed ? parseFloat(speed) : this.maxSpeed;
		this.indicator.nativeElement.style.transform = `rotate(${
			135 + (180 / this.maxSpeed) * speedFloat
		}deg)`;
	}

	constructor(readonly service: TestingService) {}

	ngAfterViewInit(): void {
		this.updateIndicator(this.value);
	}
}
