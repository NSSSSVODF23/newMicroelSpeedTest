import { Component, OnInit } from "@angular/core";
import { LazyLoadEvent } from "primeng/api";
import { DeviceInfo } from "src/app/common/service/device-info.service";
import { DeviceFilter } from "src/app/common/transport/filters/device-filter";
import { DeviceService } from "../../service/device.service";
import {
	debounceTime,
	distinctUntilChanged,
	Subject,
	Subscription,
} from "rxjs";
import { House } from "src/app/common/transport/models/house";
import { HouseService } from "../../service/house.service";
import { Router } from "@angular/router";

function getCountOfMeasures(device: DeviceInfo) {
	return device.measures?.length ?? 1;
}

function getAvgDownloadSpeed(device: DeviceInfo) {
	const sumOfSpeed =
		device.measures?.reduce(
			(prev, curr) => prev + (curr.downloadSpeed ?? 0),
			0,
		) ?? 0;
	return sumOfSpeed / getCountOfMeasures(device);
}

function getAvgUploadSpeed(device: DeviceInfo) {
	const sumOfSpeed =
		device.measures?.reduce(
			(prev, curr) => prev + (curr.uploadSpeed ?? 0),
			0,
		) ?? 0;
	return sumOfSpeed / getCountOfMeasures(device);
}

function mapAvgInfo(devices: DeviceInfo[]) {
	return devices.map((device) => {
		const tempDevice = { ...device };
		tempDevice.avgDownload = getAvgDownloadSpeed(device);
		tempDevice.avgUpload = getAvgUploadSpeed(device);
		tempDevice.measureCount = getCountOfMeasures(device);
		return tempDevice;
	});
}

@Component({
	templateUrl: "./devices-page.component.html",
	styleUrls: ["./devices-page.component.scss"],
})
export class DevicesPageComponent implements OnInit {
	devices: DeviceInfo[] = [];

	totalRecords = 0;
	rows = 10;
	loading!: boolean;

	filterDateRangeValue: string[] = [];
	searchFilters: DeviceFilter = {};
	searchObserver: Subject<DeviceFilter> = new Subject();

	lastEvent!: LazyLoadEvent;

	selectedMeasure!: DeviceInfo;

	first = 0;

	houseList: House[] = [];

	ipInputFilter: RegExp = /^[\d\.]+$/;

	constructor(
		readonly device: DeviceService,
		readonly house: HouseService,
		readonly router: Router,
	) {}

	ngOnInit(): void {
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

	loadMeasures(event: LazyLoadEvent) {
		this.loading = true;
		this.lastEvent = event;
		if (event.first !== undefined && event.rows !== undefined) {
			this.searchFilters.first = event.first;
			this.searchFilters.rows = event.rows;
			this.device
				.getFilteredDevices(this.searchFilters)
				.subscribe((devices) => {
					this.loading = false;
					this.devices = mapAvgInfo(devices.data?.getFilteredDevices);
					this.totalRecords = devices.data?.getTotalDevices;
				});
		}
	}

	filterChangeHandler(event: any) {
		this.searchObserver.next(Object.assign({}, this.searchFilters));
	}

	resetFilters() {
		this.searchFilters = {
			ip: undefined,
			deviceId: undefined,
			hostname: undefined,
		};
		this.filterDateRangeValue = [];
		this.searchObserver.next(Object.assign({}, this.searchFilters));
	}

	addressResetFunction(options: any) {
		this.searchFilters.address = undefined;
		this.searchObserver.next(Object.assign({}, this.searchFilters));
	}

	openLastMeasure(event: any) {
		const lastMeasureIndex = event.data.measures?.length - 1;
		const lastMeasureId = event.data.measures[lastMeasureIndex]?.measureId;
		if (lastMeasureId) {
			this.router.navigate(["admin/measure"], {
				queryParams: { id: lastMeasureId },
			});
		}
	}
}
