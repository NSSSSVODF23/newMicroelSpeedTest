import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { info } from "console";
import { TieredMenu } from "primeng/tieredmenu";
import { getChartOptions } from "src/app/common/method/math";
import { DashboardService } from "../../service/dashboard.service";

@Component({
	templateUrl: "./dashboard-page.component.html",
	styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
	@ViewChild("statisticMenu") statisticMenu?: ElementRef<TieredMenu>;
	networkChartData = {};
	cpuChartData = {};
	memoryChartData = {};

	networkChartOptions = getChartOptions("Мбит/с");
	cpuChartOptions = getChartOptions("%");
	memoryChartOptions = getChartOptions("Мбайт");

	statisticName = "топ-10 домов по замерам";
	statisticMenuItems = [
		{
			label: "Выбрать",
			items: [
				{
					label: "New",
					icon: "pi pi-fw pi-plus",
					items: [{ label: "Project" }, { label: "Other" }],
				},
				{ label: "Open" },
				{ label: "Quit" },
			],
		},
	];
	statisticChartData = {};
	statisticChartOptions = {};

	constructor(readonly dashboard: DashboardService) {}

	ngOnInit(): void {
		this.dashboard.getPerformance().subscribe((info) => {
			this.networkChartData = {
				datasets: [
					{
						label: "RX Трафик",
						data: info.receivedChartData,
						fill: false,
						borderColor: "#1fecff",
						tension: 0.4,
					},
					{
						label: "TX Трафик",
						data: info.transceivedChartData,
						fill: false,
						borderColor: "#ffb41f",
						tension: 0.4,
					},
				],
			};
			this.cpuChartData = {
				datasets: [
					{
						label: "Нагрузка",
						data: info.cpuChartData,
						fill: false,
						borderColor: "#1fecff",
						tension: 0.4,
					},
				],
			};
			this.memoryChartData = {
				datasets: [
					{
						label: "Всего",
						data: info.totalMemoryChartData,
						fill: false,
						borderColor: "#1fecff",
						tension: 0.4,
					},
					{
						label: "Занято",
						data: info.memoryChartData,
						fill: false,
						borderColor: "#ffb41f",
						tension: 0.4,
					},
				],
			};
		});
	}
}
