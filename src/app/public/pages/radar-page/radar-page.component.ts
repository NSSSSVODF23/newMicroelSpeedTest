import {Component, OnDestroy, OnInit} from '@angular/core';
import {SpeedCounter} from "../../../common/class/speed-counter";
import {DownloadTestingRequest} from "../../../common/class/requests/download-testing-request";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";

@Component({
    templateUrl: './radar-page.component.html',
    styleUrls: ['./radar-page.component.scss']
})
export class RadarPageComponent implements OnInit, OnDestroy {

    counter = new SpeedCounter(new DownloadTestingRequest(300_000));
    duration = 300_000;
    sessionEnd = false;

    constructor(readonly router: Router, readonly titleService: Title) {
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Радар")
        this.counter.run()
        const endTime = Date.now() + 300_000;
        const interval = setInterval(() => {
            this.duration = endTime - Date.now();
            if (this.duration < 0) this.duration = 0
        }, 60);
        this.counter.getObserver().subscribe({
            error: this.errorHandler.bind(this),
            complete: () => {
                clearInterval(interval);
                this.sessionEnd = true;
            }
        })
    }

    ngOnDestroy(): void {
        this.counter.abort()
        this.counter = new SpeedCounter(new DownloadTestingRequest(300_000))
    }

    restart() {
        location.reload()
    }

    private errorHandler(err: any) {
        this.router.navigate(['error'], {queryParams: {err}}).then()
    }

}
