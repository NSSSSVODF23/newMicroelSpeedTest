import {
	animate,
	state,
	style,
	transition,
	trigger,
} from "@angular/animations";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LazyLoadEvent } from "primeng/api";
import { Table } from "primeng/table";
import { SpeedChartComponent } from "src/app/common/components/speed-chart/speed-chart.component";
import { MeasureFilter } from "src/app/common/transport/filters/measure-filter";
import { Measure } from "src/app/common/transport/models/measure";
import { MeasureService } from "../../service/measure.service";

const extendAnimation = trigger("anotherMeasureExtend", [
	state(
		"show",
		style({
			height: "387px",
		}),
	),
	state(
		"hide",
		style({
			height: "37px",
		}),
	),
	transition("show <=> hide", [animate(".3s ease-out")]),
]);

@Component({
	templateUrl: "./measure-page.component.html",
	styleUrls: ["./measure-page.component.scss"],
	animations: [extendAnimation],
})
export class MeasurePageComponent implements OnInit {
	currentMeasure?: Measure;
	@ViewChild("downloadSpeedChart")
	downloadSpeedChart?: SpeedChartComponent;
	@ViewChild("uploadSpeedChart")
	uploadSpeedChart?: SpeedChartComponent;
	@ViewChild("#anotherMeasuresTable")
	anotherMeasureTable?: Table;

	selectedMeasure?: Measure;
	anotherMeasureByLogin: Measure[] = [];
	anotherMeasureFilter: MeasureFilter = {
		first: 0,
		rows: 20,
	};
	anotherMeasureExtend: "show" | "hide" = "hide";

	totalRecords = 0;
	loading = true;

	lastLoadEvent!: any;

	constructor(
		readonly route: ActivatedRoute,
		readonly router: Router,
		readonly measure: MeasureService,
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const measureId = params["id"];
			if (measureId) {
				this.measure.getMeasureById(measureId).subscribe((measure) => {
					this.currentMeasure = measure.data?.getMeasure;
					this.anotherMeasureFilter.login = this.currentMeasure?.session?.login;
				});
			}
		});
	}

	updateCharts(event: any): void {
		setTimeout(() => {
			this.downloadSpeedChart?.redraw();
			this.uploadSpeedChart?.redraw();
		});
	}

	selectMeasure(event: any): void {
		this.selectedMeasure = event.data;
		if (this.selectedMeasure) {
			this.anotherMeasureFilter.first = event.first;
			this.anotherMeasureFilter.rows = event.rows;
			this.router.navigate(["/admin/measure"], {
				queryParams: {
					id: this.selectedMeasure.measureId,
				},
			});
		}
	}

	loadMeasures(event: LazyLoadEvent): void {
		this.loading = true;
		if (this.currentMeasure) {
			this.lastLoadEvent = event;
			this.anotherMeasureFilter.first = event.first;
			this.anotherMeasureFilter.rows = event.rows;
			this.measure
				.getFilteredMeasures(this.anotherMeasureFilter)
				.subscribe((measure) => {
					if (event.first !== undefined && event.rows !== undefined) {
						if (this.anotherMeasureByLogin.length === 0) {
							this.anotherMeasureByLogin = Array.from({
								length: measure.data?.getTotalMeasures,
							});
						} else if (
							this.anotherMeasureByLogin.length < measure.data?.getTotalMeasures
						) {
							this.anotherMeasureByLogin = this.anotherMeasureByLogin.concat(
								Array.from({
									length:
										measure.data?.getTotalMeasures -
										this.anotherMeasureByLogin.length,
								}),
							);
						} else if (
							this.anotherMeasureByLogin.length > measure.data?.getTotalMeasures
						) {
							this.anotherMeasureByLogin = this.anotherMeasureByLogin.slice(
								0,
								measure.data?.getTotalMeasures,
							);
						}
						this.anotherMeasureByLogin.splice(
							event.first,
							event.rows,
							...measure.data?.getFilteredMeasures,
						);
						this.anotherMeasureByLogin = [...this.anotherMeasureByLogin];
						this.loading = false;
					}
				});
		}
	}

	changeExtend() {
		if (this.anotherMeasureExtend === "hide") {
			this.anotherMeasureExtend = "show";
		} else {
			this.anotherMeasureExtend = "hide";
		}
	}
}
