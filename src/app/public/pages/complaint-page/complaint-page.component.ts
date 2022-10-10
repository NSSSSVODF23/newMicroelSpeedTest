import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PublicApiService} from "../../service/public-api.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Title} from "@angular/platform-browser";

const animations = [
    trigger("controls", [
        state("hide", style({opacity: 0, 'pointer-events': 'none'})),
        transition("*=>hide", [
            style({opacity: 1}),
            animate(".4s", style({opacity: 0})),
        ])
    ])
]

@Component({
    templateUrl: './complaint-page.component.html',
    styleUrls: ['./complaint-page.component.scss'],
    animations
})
export class ComplaintPageComponent implements OnInit {

    formGroup = new FormGroup({
        phone: new FormControl("", Validators.required),
        description: new FormControl("", Validators.required),
        captchaToken: new FormControl(null)
    })

    robotError = false;
    loading = false;
    loaded = false;

    controlsAnimationState = '';
    isMobile = false;

    constructor(readonly api: PublicApiService, readonly breakpoint: BreakpointObserver, readonly titleService: Title) {
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Тех. Поддержка")
        this.breakpoint.observe(["(max-width: 606px)"]).subscribe(result => this.isMobile = result.matches)
    }

    captchaResponse(event: any) {
        this.formGroup.patchValue({captchaToken: event.response})
    }

    submit() {
        this.controlsAnimationState = 'hide';
        this.loading = true;
        setTimeout(() => {
            this.api.putComplaint(this.formGroup.getRawValue()).subscribe(result => {
                if (result.isError) {
                    this.robotError = true;
                    setTimeout(() => {
                        this.loading = false;
                        this.controlsAnimationState = '';
                    }, 1000)
                } else {
                    setTimeout(() => {
                        this.loading = false;
                        this.loaded = true;
                    }, 1000)
                }
            });
        }, 400)
    }
}
