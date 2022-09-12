import { animate, style, transition, trigger } from "@angular/animations";
import { BreakpointObserver } from "@angular/cdk/layout";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TestingResultValues } from "src/app/common/class/speed-test-controller";
import { SpeedChartPoint } from "src/app/common/components/speed-chart/speed-chart.component";
import { Measure } from "src/app/common/transport/models/measure";

const flowResultCard = trigger("flowResult", [
	transition(":enter", [
		style({
			opacity: 0,
			transform: "translateY(-1rem)",
		}),
		animate(
			"600ms ease-in",
			style({
				opacity: 1,
				transform: "translateY(0)",
			}),
		),
	]),
	transition(":leave", [
		style({
			opacity: 1,
			transform: "translateY(0)",
		}),
		animate(
			"0ms ease-in",
			style({
				opacity: 0,
				transform: "translateY(-1rem)",
			}),
		),
	]),
]);

const flowControlCard = trigger("flowControl", [
	transition(":enter", [
		style({
			opacity: 0,
			transform: "translateY(-1rem)",
		}),
		animate(
			"500ms 500ms ease-out",
			style({
				opacity: 1,
				transform: "translateY(0)",
			}),
		),
	]),
	transition(":leave", [
		style({
			opacity: 1,
			transform: "translateY(0)",
		}),
		animate(
			"0ms ease-in",
			style({
				opacity: 0,
				transform: "translateY(-1rem)",
			}),
		),
	]),
]);

const fadeIn = trigger("fade", [
	transition(":enter", [
		style({
			opacity: 0.3,
		}),
		animate(
			"400ms ease-in",
			style({
				opacity: 1,
			}),
		),
	]),
	transition(":leave", [
		style({
			opacity: 1,
		}),
		animate(
			"0ms ease-in",
			style({
				opacity: 0,
			}),
		),
	]),
]);

@Component({
	templateUrl: "./result-page.component.html",
	styleUrls: ["./result-page.component.scss"],
	animations: [flowResultCard, flowControlCard, fadeIn],
})
export class ResultPageComponent implements OnInit {
	measure?: Measure;
	isMobile: boolean = false;

	constructor(
		readonly route: ActivatedRoute,
		readonly breakpointObserver: BreakpointObserver,
		readonly http: HttpClient,
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.http
				.post(
					`http://${location.hostname}:8080/public/measure?id=${params["id"]}`,
					null,
				)
				.subscribe((result) => {
					this.measure = result as Measure;
				});
		});
		this.breakpointObserver
			.observe(["(max-width: 992px)"])
			.subscribe((result) => {
				if (result.matches) {
					this.isMobile = true;
				} else {
					this.isMobile = false;
				}
			});
	}

	getChartData(): SpeedChartPoint[][] {
		if (this.measure?.downloadSpeedChart && this.measure?.uploadSpeedChart) {
			return [this.measure.downloadSpeedChart, this.measure.uploadSpeedChart];
		} else {
			return [[], []];
		}
	}

	getDownloadResult(): TestingResultValues {
		return {
			speed: this.measure?.downloadSpeed?.toFixed(2).toString() ?? "-",
			stability: this.measure?.downloadStability?.toFixed(2).toString() ?? "-",
			loss: this.measure?.downloadLoss?.toFixed(2).toString() ?? "-",
			chartData: [],
		};
	}

	getUploadResult(): TestingResultValues {
		return {
			speed: this.measure?.uploadSpeed?.toFixed(2).toString() ?? "-",
			stability: this.measure?.uploadStability?.toFixed(2).toString() ?? "-",
			loss: this.measure?.uploadLoss?.toFixed(2).toString() ?? "-",
			chartData: [],
		};
	}

	getPing(): string {
		return this.measure?.ping?.toFixed(3).toString() ?? "-";
	}

	getJitter(): string {
		return this.measure?.pingJitter?.toFixed(3).toString() ?? "-";
	}
}
