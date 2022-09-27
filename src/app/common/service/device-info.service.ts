import {Injectable} from "@angular/core";
import {v4, validate} from "uuid";
import {Measure} from "../transport/models/measure";
import {Session} from "../transport/models/session";

export interface Device {
    deviceId?: string;
    ip?: String;
    hostname?: string;
    system?: string;
    platform?: string;
    userAgent?: string;
    isMobile?: boolean;
    measures?: Measure[];
    lastSession?: Session;
}

@Injectable({
    providedIn: "root",
})
export class DeviceInfoService {
    deviceId!: string;
    platform = navigator ? navigator.platform : "Неизвестная платформа";
    system = DeviceInfoService.getOS();
    userAgent = navigator ? navigator.userAgent : "Пустой userAgent";
    isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        );

    constructor() {
        this.deviceId = localStorage.getItem("deviceId")!;
        if (!validate(this.deviceId)) {
            this.deviceId = v4();
            localStorage.setItem("deviceId", this.deviceId);
        }
    }

    // Function get operating system from navigator
    static getOS = () => {
        let OSName = "Неизвестная система";
        if (!navigator || !("appVersion" in navigator)) return OSName;
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
        return OSName;
    };

    // Function get device info object
    getDeviceInfo = (): Device => {
        return {
            deviceId: this.deviceId,
            platform: this.platform,
            system: this.system,
            userAgent: this.userAgent,
            isMobile: this.isMobile,
        };
    };
}
