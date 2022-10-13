import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "connectionType",
})
export class ConnectionTypePipe implements PipeTransform {
    transform(value: string | number | undefined, ...args: unknown[]): string {
        if (value === "ETHERNET") {
            return "../../../../assets/icons/ethernet.svg";
        } else if (value === "WIFI") {
            return "../../../../assets/icons/wifi.svg";
        } else if (value === 0) {
            return "../../../../assets/icons/ethernet.svg";
        } else if (value === 1) {
            return "../../../../assets/icons/wifi.svg";
        } else {
            return "../../../../assets/icons/wifi.svg";
        }
    }
}
