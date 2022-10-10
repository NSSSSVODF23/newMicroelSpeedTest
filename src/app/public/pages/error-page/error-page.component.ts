import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Title} from "@angular/platform-browser";

@Component({
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
    error = "";

    constructor(readonly route: ActivatedRoute, readonly titleService: Title) {
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Ошибка")
        this.route.queryParams.subscribe(params => this.error = params['err'])
    }

}
