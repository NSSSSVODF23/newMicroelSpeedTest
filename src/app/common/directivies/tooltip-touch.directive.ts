import {AfterViewInit, Directive, ElementRef, HostListener, Input, NgZone, OnDestroy} from '@angular/core';
import {Tooltip} from "primeng/tooltip";
import {PrimeNGConfig} from "primeng/api";

@Directive({
    selector: '[appTooltipTouch]',
    exportAs: 'appTooltipTouch'
})
export class TooltipTouchDirective {

    constructor(element: ElementRef<HTMLElement>) {
        element.nativeElement.setAttribute("tabindex", '0');
        element.nativeElement.style.outline = '0';
    }

}
