import {SpeedCounter} from "../../class/speed-counter";
import {PingTestController} from "../../class/ping-test-controller";
import {SpeedChartPoint} from "../../components/speed-chart/speed-chart.component";
import {Device} from "../../service/device-info.service";
import {Session} from "./session";
import {MeasureActionTypes} from "./measure-action-message";
import {MeasureConnectionTypes} from "../enums/connection-types";

/**
 * Модель данных для транспортировки информации об измерении.
 */
export class Measure {
    measureId?: number;
    device?: Device;
    session?: Session;
    created?: Date;
    connectionType?: MeasureConnectionTypes;
    ping?: number;
    pingJitter?: number;
    downloadSpeed?: number;
    downloadSpeedUser?: number;
    downloadStability?: number;
    downloadLoss?: number;
    downloadSpeedChart?: SpeedChartPoint[];
    downloadSpeedChartUser?: SpeedChartPoint[];
    uploadSpeed?: number;
    uploadSpeedUser?: number;
    uploadStability?: number;
    uploadLoss?: number;
    uploadSpeedChart?: SpeedChartPoint[];
    uploadSpeedChartUser?: SpeedChartPoint[];
    isUsed?: boolean;
    isFailed?: boolean;
    isBeginning?: boolean;

    constructor(
        ping?: PingTestController,
        download?: SpeedCounter,
        upload?: SpeedCounter,
    ) {
        this.ping = ping?.pingValue;
        this.pingJitter = ping?.jitterValue;
        this.downloadSpeed = download?.currentValue;
        this.downloadSpeedUser = download?.slowCurrentValue;
        this.downloadStability = download?.stability;
        this.downloadLoss = download?.percentLoss;
        this.downloadSpeedChart = download?.chartData;
        this.downloadSpeedChartUser = download?.slowChartData;
        this.uploadSpeed = upload?.currentValue;
        this.uploadSpeedUser = upload?.slowCurrentValue;
        this.uploadStability = upload?.stability;
        this.uploadLoss = upload?.percentLoss;
        this.uploadSpeedChart = upload?.chartData;
        this.uploadSpeedChartUser = upload?.slowChartData;
    }
}
