import { Component, OnInit, ViewChild } from "@angular/core";
import { LazyLoadEvent } from "primeng/api";
import {
	debounceTime,
	distinctUntilChanged,
	Subject,
	Subscription,
} from "rxjs";
import { MeasureFilter } from "src/app/common/transport/filters/measure-filter";
import { Measure } from "src/app/common/transport/models/measure";
import { MeasureService } from "../../service/measure.service";
import { Table } from "primeng/table";
import { House } from "src/app/common/transport/models/house";
import { HouseService } from "../../service/house.service";
import { Router } from "@angular/router";

@Component({
	templateUrl: "./index-page.component.html",
	styleUrls: ["./index-page.component.scss"],
})
export class IndexPageComponent implements OnInit {
	allMeasures: Measure[] = [];
	beginningMeasures: Measure[] = [];
	measures: Measure[] = [];

	totalRecords = 0;
	rows = 10;
	loading!: boolean;

	filterDateRangeValue: string[] = [];
	searchFilters: MeasureFilter = {
		login: undefined,
		ip: undefined,
		mac: undefined,
		address: undefined,
		start: undefined,
		end: undefined,
	};
	searchObserver: Subject<MeasureFilter> = new Subject();

	houseList: House[] = [];

	lastEvent!: LazyLoadEvent;

	selectedMeasure!: Measure;

	first = 0;

	addressResetFunction(options: any) {
		this.searchFilters.address = undefined;
		this.searchObserver.next(Object.assign({}, this.searchFilters));
	}

	ipInputFilter: RegExp = /^[\d\.]+$/;
	macInputFilter: RegExp = /^[\da-f:]+$/;

	private filteredMeasuresSubscription!: Subscription;
	private numberOfFilteredMeasuresSubscription!: Subscription;

	constructor(
		readonly measure: MeasureService,
		readonly house: HouseService,
		readonly router: Router,
	) {}

	private concatenateMeasures(): void {
		this.allMeasures = [...this.beginningMeasures, ...this.measures];
	}

	private updateBeginningMeasures(measures: any): void {
		const beginningMeasures = measures.data?.getBeginningMeasures;
		if (beginningMeasures) {
			this.beginningMeasures = beginningMeasures;
			this.concatenateMeasures();
		}
	}

	ngOnInit(): void {
		console.log("init");
		this.loading = true;
		this.measure
			.getBeginningMeasuresSubscription()
			.subscribe(this.updateBeginningMeasures.bind(this));
		this.measure
			.getBeginningMeasures()
			.subscribe(this.updateBeginningMeasures.bind(this));
		this.searchObserver
			.pipe(
				debounceTime(1000),
				distinctUntilChanged((prev, curr) => {
					return JSON.stringify(prev) === JSON.stringify(curr);
				}),
			)
			.subscribe(() => {
				this.lastEvent.first = 0;
				this.first = 0;
				this.loadMeasures(this.lastEvent);
			});
		this.house.getAllHouses().subscribe((houses) => {
			this.houseList = [
				{ address: "Все дома", houseId: undefined, vlan: 0 },
				...houses.data?.getAllHouses,
			];
		});
	}

	filterChangeHandler(event: any) {
		this.searchObserver.next(Object.assign({}, this.searchFilters));
	}

	filterChangeDateRangeHandler(event: Date[]) {
		if (event && event[0] && event[1]) {
			this.searchFilters.start = event[0].toLocaleString("ISO");

			// Устанавливаем время у конечной даты на конец суток
			const tempEndDate = event[1];
			tempEndDate.setHours(23, 59, 59, 999);

			this.searchFilters.end = tempEndDate.toLocaleString("ISO");
			this.searchObserver.next(Object.assign({}, this.searchFilters));
		} else {
			this.searchFilters.start = undefined;
			this.searchFilters.end = undefined;
			this.searchObserver.next(Object.assign({}, this.searchFilters));
		}
	}

	loadMeasures(event: LazyLoadEvent) {
		this.loading = true;
		this.lastEvent = event;
		if (event.first !== undefined && event.rows !== undefined) {
			this.searchFilters.first = event.first;
			this.searchFilters.rows = event.rows;
			this.measure
				.getFilteredMeasures(this.searchFilters)
				.subscribe((measures) => {
					this.loading = false;
					this.measures = measures.data?.getFilteredMeasures;
					this.totalRecords = measures.data?.getTotalMeasures;
					this.concatenateMeasures();
				});
			if (this.filteredMeasuresSubscription)
				this.filteredMeasuresSubscription.unsubscribe();
			this.filteredMeasuresSubscription = this.measure
				.getFilteredMeasuresSubscription(this.searchFilters)
				.subscribe((measures) => {
					this.measures = measures.data?.getFilteredMeasures ?? [];
					this.totalRecords = measures.data?.getTotalMeasures ?? 0;
					this.concatenateMeasures();
				});
			if (this.numberOfFilteredMeasuresSubscription)
				this.numberOfFilteredMeasuresSubscription.unsubscribe();
			this.numberOfFilteredMeasuresSubscription = this.measure
				.getNumberOfFilteredMeasuresSubscription()
				.subscribe((measures) => {
					this.totalRecords = measures.data?.getTotalMeasures ?? 0;
				});
		}
	}

	resetFilters() {
		this.searchFilters = {
			login: undefined,
			ip: undefined,
			mac: undefined,
			address: undefined,
			start: undefined,
			end: undefined,
		};
		this.filterDateRangeValue = [];
		this.searchObserver.next(Object.assign({}, this.searchFilters));
	}

	selectMeasure(event: any) {
		if (event.data && event.data.measureId) {
			this.router.navigate(["/admin/measure"], {
				queryParams: { id: event.data.measureId },
			});
		}
	}
}
