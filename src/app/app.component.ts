import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from "primeng/api";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Microel Тест Скорости';

    constructor(readonly primeNGConfig: PrimeNGConfig) {
    }

    ngOnInit(): void {
        this.primeNGConfig.ripple = true;
    }
}
