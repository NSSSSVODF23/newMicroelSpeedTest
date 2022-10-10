import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PagingLoadService} from "../../../common/class/paging-load-service";
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";
import {VirtualScroller} from "primeng/virtualscroller";
import {LoadingController} from "../../../common/class/page-loaders/controllers/loading-controller";
import {ListQueryLoader} from "../../../common/class/page-loaders/controllers/list-query-loader";
import {ListLoader} from "../../../common/class/page-loaders/controllers/list-loader";

const animations = [
    trigger("fade", [
        transition('*=>*', [
            query(':enter', [
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
    selector: 'app-lazy-list',
    templateUrl: './lazy-list.component.html',
    styleUrls: ['./lazy-list.component.scss'],
    animations
})
export class LazyListComponent implements OnInit {
    @Input() service!: ListQueryLoader<any> | ListLoader<any>
    @Input() dataKey!: string
    @Input() selectionMode!: string
    @Input() colNames!: string[]
    @Input() itemRef!: TemplateRef<any>
    @Input() itemSize!: number
    @Input() loadingRef!: TemplateRef<any>
    @Input() scrollHeight!: string

    constructor() {
    }

    @Input() onSelect: (event: any) => void = () => {
    };

    ngOnInit(): void {
    }
}
