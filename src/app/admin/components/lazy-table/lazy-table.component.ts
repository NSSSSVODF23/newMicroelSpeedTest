import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {PagingLoadService} from "../../../common/class/paging-load-service";
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";
import {LoadingController} from "../../../common/class/page-loaders/controllers/loading-controller";
import {TableQueryLoader} from "../../../common/class/page-loaders/controllers/table-query-loader";

const animations = [
    trigger("fade", [
        transition('*=>*', [
            query('.row:enter', [
                style({opacity: 0}),
                stagger(10, [
                    style({opacity: 0, transform: 'translateX(-2rem)'}),
                    animate('0.2s', style({opacity: 1, transform: 'translateX(0)'}))
                ])
            ], {optional: true}),
        ]),
    ])
]

@Component({
    selector: 'app-lazy-table',
    templateUrl: './lazy-table.component.html',
    styleUrls: ['./lazy-table.component.scss'],
    animations
})
export class LazyTableComponent implements OnInit {
    @Input() service!: TableQueryLoader<any>
    @Input() dataKey!: string
    @Input() selectionMode!: string
    @Input() colNames!: string[]
    @Input() rowRef!: TemplateRef<any>

    constructor() {
    }

    @Input() onSelect: (event: any) => void = () => {
    };

    ngOnInit(): void {
    }
}
