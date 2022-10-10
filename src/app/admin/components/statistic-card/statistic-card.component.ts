import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-statistic-card',
    templateUrl: './statistic-card.component.html',
    styleUrls: ['./statistic-card.component.scss']
})
export class StatisticCardComponent implements OnInit {

    @Input() title = "";
    @Input() firstValue: number | string | null = 0;
    @Input() secondValue: number | string | null = 0;
    @Input() firstSuffix = "";
    @Input() secondSuffix = "";

    constructor() {
    }

    ngOnInit(): void {
    }

}
