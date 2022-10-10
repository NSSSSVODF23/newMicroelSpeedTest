import {Directive, HostListener} from '@angular/core';

@Directive({
    selector: '[appHScroll]'
})
export class HScrollDirective {

    lastX?: number

    constructor() {
    }

    @HostListener("wheel", ['$event'])
    public scroll(event: any): void {
        event.preventDefault();
        event.currentTarget.scroll(event.currentTarget.scrollLeft + event.deltaY, 0)
    }

    @HostListener("touchstart", ['$event'])
    public touchStart(event: TouchEvent) {
        this.lastX = event.changedTouches.item(0)?.clientX;
    }

    @HostListener("touchmove", ['$event'])
    public swipe(event: any) {
        const currentTouch = event.changedTouches.item(0)
        if (this.lastX && currentTouch && event.currentTarget) {
            const deltaX = this.lastX - currentTouch.clientX
            event.currentTarget.scroll(event.currentTarget.scrollLeft + deltaX, 0)
            this.lastX = currentTouch.clientX;
        }
    }
}
