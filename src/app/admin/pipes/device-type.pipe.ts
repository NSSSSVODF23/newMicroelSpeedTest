import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "deviceType",
})
export class DeviceTypePipe implements PipeTransform {
	transform(value: boolean, ...args: unknown[]): string {
		return value
			? "../../../../assets/icons/mobile.svg"
			: "../../../../assets/icons/desktop.svg";
	}
}
