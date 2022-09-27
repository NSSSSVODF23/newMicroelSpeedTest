import {Device} from "../../service/device-info.service";
import {MeasureConnectionTypes} from "../enums/connection-types";
import {Measure} from "./measure";

export enum MeasureActionTypes {
    DEVICE_INFO,
    START,
    END,
    ERROR,
    RESULT,
    ABORT,
    GET_DEVICE_INFO,
    TESTING_MODE,
}

export interface MeasureActionMessage {
    type: MeasureActionTypes;
    deviceInfo: Device;
    connectionType?: MeasureConnectionTypes;
    result?: Measure;
    resultId?: number;
    isPro?: boolean;
}
