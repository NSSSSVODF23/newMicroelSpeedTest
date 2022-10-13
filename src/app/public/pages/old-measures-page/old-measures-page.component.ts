import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreakpointObserver} from "@angular/cdk/layout";
import {Subscription} from "rxjs";
import {PublicApiService} from "../../service/public-api.service";
import {Measure} from "../../../common/transport/models/measure";
import {Page} from "../../../common/transport/models/page";
import {Title} from "@angular/platform-browser";

@Component({
    templateUrl: './old-measures-page.component.html',
    styleUrls: ['./old-measures-page.component.scss']
})
export class OldMeasuresPageComponent implements OnInit, OnDestroy {

    isMobile: boolean = false;
    subscriptions: Subscription[] = [];
    measuresPage: Page<Measure> = {content: [], totalElements: 0};
    loading = true;

    constructor(readonly breakpoint: BreakpointObserver, readonly api: PublicApiService, readonly title: Title) {
    }

    ngOnInit(): void {
        this.title.setTitle("Microel.МЕТР - Мои результаты")
        this.subscriptions.push(this.breakpoint.observe("(max-width:600px)").subscribe(o => this.isMobile = o.matches));
        this.api.oldMeasurements().subscribe(r => {
            if (!r.isError && r.responseBody) {
                this.loading = false;
                this.measuresPage = r.responseBody;
            }
        })
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

}
