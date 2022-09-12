import { Component, Input, OnInit } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Component({
	selector: "app-input-error-message",
	templateUrl: "./input-error-message.component.html",
	styleUrls: ["./input-error-message.component.scss"],
})
export class InputErrorMessageComponent implements OnInit {
	@Input() control?: AbstractControl;
	@Input() errors?: { [key: string]: string } = {};

	constructor() {}

	ngOnInit(): void {}
}
