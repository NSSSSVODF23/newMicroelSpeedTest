import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-top-panel',
    templateUrl: './top-panel.component.html',
    styleUrls: ['./top-panel.component.scss']
})
export class TopPanelComponent implements OnInit {

    constructor(readonly router: Router) {
    }

    ngOnInit(): void {
    }

}
