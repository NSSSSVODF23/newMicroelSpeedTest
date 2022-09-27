import {MeasureConnectionTypes} from "../enums/connection-types";

export interface NetworkUtil {
    networkUtilId?: number;
    stamp?: Date;
    rx?: number;
    tx?: number;
}

export interface CpuUtil {
    cpuUtilId?: number;
    stamp?: Date;
    load?: number;
}

export interface RamUtil {
    ramUtilId?: number;
    stamp?: Date;
    utilized?: number;
    total?: number;
}

export interface TimeNumberPoint {
    x: Date;
    y: number;
}

export interface GroupCTypeDayIntegerPoint {
    x: Date;
    y: number;
    g: MeasureConnectionTypes;
}

export interface GroupStringDayIntegerPoint {
    x: Date;
    y: number;
    g: string;
}

export interface GroupCTypeStringIntegerPoint {
    x: string;
    y: number;
    g: MeasureConnectionTypes;
}

export interface ActiveSession {
    id: string;
    deviceId: string;
    isMobile: boolean;
    login: string;
    address: string;
    isStarted: boolean;
    hasInfo: boolean;
}