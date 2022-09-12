import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "connectionType",
})
export class ConnectionTypePipe implements PipeTransform {
	transform(value: string, ...args: unknown[]): string {
		if (value === "ETHERNET") {
			return "../../../../assets/icons/ethernet.svg";
		} else if (value === "WIFI") {
			return "../../../../assets/icons/wifi.svg";
		} else {
			return value;
		}
	}
}
