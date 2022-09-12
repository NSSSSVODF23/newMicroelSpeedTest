import { SpeedTestController } from "../../class/speed-test-controller";
import { PingTestController } from "../../class/ping-test-controller";
import { SpeedChartPoint } from "../../components/speed-chart/speed-chart.component";
import { DeviceInfo } from "../../service/device-info.service";
import { Session } from "./session";
import { MeasureActionTypes } from "./measure-action-message";
import { Observable, of } from "rxjs";

/**
 * Модель данных для транспортировки информации о измерении.
 */
export class Measure {
	measureId?: number;
	device?: DeviceInfo;
	session?: Session;
	created?: Date;
	connectionType?: MeasureActionTypes;
	ping?: number;
	pingJitter?: number;
	downloadSpeed?: number;
	downloadStability?: number;
	downloadLoss?: number;
	downloadSpeedChart?: SpeedChartPoint[];
	uploadSpeed?: number;
	uploadStability?: number;
	uploadLoss?: number;
	uploadSpeedChart?: SpeedChartPoint[];
	isUsed?: boolean;
	isFailed?: boolean;
	isBeginning?: boolean;

	constructor(
		ping?: PingTestController,
		download?: SpeedTestController,
		upload?: SpeedTestController,
	) {
		this.ping = ping?.pingValue;
		this.pingJitter = ping?.jitterValue;
		this.downloadSpeed = download?.currentValue;
		this.downloadStability = download?.stability;
		this.downloadLoss = download?.percentLoss;
		this.downloadSpeedChart = download?.chartData;
		this.uploadSpeed = upload?.currentValue;
		this.uploadStability = upload?.stability;
		this.uploadLoss = upload?.percentLoss;
		this.uploadSpeedChart = upload?.chartData;
	}
}
