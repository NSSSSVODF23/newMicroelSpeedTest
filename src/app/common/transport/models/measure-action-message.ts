import { DeviceInfo } from "../../service/device-info.service";
import { MeasureConnectionTypes } from "../enums/connection-types";
import { Measure } from "./measure";

export enum MeasureActionTypes {
	PREPARE,
	START,
	END,
	ERROR,
	RESULT,
	ABORT,
}

export interface MeasureActionMessage {
	type: MeasureActionTypes;
	deviceInfo: DeviceInfo;
	connectionType?: MeasureConnectionTypes;
	result?: Measure;
	resultId?: number;
}
