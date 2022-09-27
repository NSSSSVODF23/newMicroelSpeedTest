import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {LazyLoadEvent} from "primeng/api";
import {MeasureFilter} from "src/app/common/transport/filters/measure-filter";
import {Measure} from "src/app/common/transport/models/measure";
import {MeasureService} from "../../service/measure.service";
import {Table} from "primeng/table";
import {House} from "src/app/common/transport/models/house";
import {HouseService} from "../../service/house.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SearchObserver} from "../../../common/observers/search_observer";
import {stringToInt} from "../../../common/method/math";
import {updateListResolver} from "../../../common/method/update_resolver";
import {ListMutationTypes} from "../../../common/transport/enums/list-mutation-types";
import {ExtendDate} from "../../../common/method/time";
import {UpdateProvider} from "../../../common/transport/models/update-provider";
import {Subscription} from "rxjs";
import {ListService} from "../../../common/class/list-service";
import {MeasurePageLoader} from "../../../common/class/page-loaders/measure-page-loader";
import {deepCopy} from "../../../common/method/object";
import {animate, animation, state, style, transition, trigger} from "@angular/animations";

const fade = trigger("fade", [
    transition(":enter", [
        style({
            opacity: 0,
            transform: "translate(-5rem,0)"
        }),
        animate(
            "200ms ease-out",
            style({
                opacity: 1,
                transform: "translate(0,0)"
            }),
        ),
    ]),
    transition(":leave", [
        style({
            opacity: 1,
            transform: "translate(0,0)"
        }),
        animate(
            "200ms ease-in-out",
            style({
                opacity: 0,
                transform: "translate(5rem,0)"
            }),
        ),
    ]),
]);

@Component({
    templateUrl: "./measures-page.component.html",
    styleUrls: ["./measures-page.component.scss"],
    animations: [fade]
})
export class MeasuresPageComponent implements OnInit, OnDestroy {
    @ViewChild("measureTable") measureTable?: Table;
    pageLoader = new ListService(new MeasurePageLoader(this.measure), this.router, this.route, ['admin', 'measures']);

    houseList: House[] = [];

    selectedMeasure?: Measure;

    ipInputFilter: RegExp = /^[\d\.]+$/;
    macInputFilter: RegExp = /^[\da-f:]+$/;

    subscriptions: Subscription[] = [];

    constructor(
        readonly measure: MeasureService,
        readonly house: HouseService,
        readonly router: Router,
        readonly route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.measure
            .getBeginning()
            .subscribe(data => {
                this.pageLoader.elements = [...data, ...this.pageLoader.elements];
            });
        this.house.getAllHouses().subscribe((houses) => {
            this.houseList = [
                {address: "Все дома", houseId: undefined, vlan: 0},
                ...houses.data?.getAllHouses,
            ];
        });
    }

    selectMeasure(event: any) {
        if (event.data && event.data.measureId) {
            this.router.navigate(["/admin/measure"], {
                queryParams: {id: event.data.measureId},
            });
        }
    }

    ngOnDestroy(): void {
        this.pageLoader.unsubscribe()
    }
}
