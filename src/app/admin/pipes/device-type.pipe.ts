import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "deviceType",
})
export class DeviceTypePipe implements PipeTransform {
    transform(value: boolean | undefined, ...args: unknown[]): string {
        if (value === undefined) return "../../../../assets/icons/mobile.svg";
        return value
            ? "../../../../assets/icons/mobile.svg"
            : "../../../../assets/icons/desktop.svg";
    }
}
