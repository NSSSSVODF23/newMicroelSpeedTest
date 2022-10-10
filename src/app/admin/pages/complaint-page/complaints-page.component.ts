import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {HouseService} from "../../service/house.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Complaint} from "../../../common/transport/models/complaint";
import {ComplaintService} from "../../service/complaint.service";
import {VirtualScroller} from "primeng/virtualscroller";
import {BreakpointObserver} from "@angular/cdk/layout";
import {ComplaintPageable} from "../../../common/class/page-loaders/complaint-pageable";
import {Title} from "@angular/platform-browser";
import {ListQueryLoader} from "../../../common/class/page-loaders/controllers/list-query-loader";

@Component({
    templateUrl: './complaints-page.component.html',
    styleUrls: ['./complaints-page.component.scss']
})
export class ComplaintsPageComponent implements OnInit, OnDestroy {
    @ViewChild("scroller") scroller?: VirtualScroller;
    complaints: Complaint[] = Array.from({length: 30});
    listLoader = new ListQueryLoader(new ComplaintPageable(this.complaint, this.house), this.router, this.route, ['admin', 'complaints'])

    selectedComplaint?: Complaint;
    complaintDialogVisible = false;

    rows = 30;

    ipInputFilter: RegExp = /^[\d\.]+$/;
    macInputFilter: RegExp = /^[\da-f:]+$/;
    processedStatuses = [
        {status: true, name: 'Обработанные'},
        {status: false, name: 'Необработанные'},
        {status: undefined, name: 'Все'},
    ];

    subscriptions: Subscription[] = [];

    searchVisible = false;
    isMobile = false;

    constructor(
        readonly complaint: ComplaintService,
        readonly house: HouseService,
        readonly router: Router,
        readonly route: ActivatedRoute,
        readonly breakpoint: BreakpointObserver,
        readonly titleService: Title
    ) {
    }

    get addressName() {
        return this.house.houses.find(h => h.houseId === this.listLoader.param()['address'])?.address ?? ""
    }

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Жалобы")
        this.subscriptions.push(
            this.breakpoint.observe('(max-width:921px)').subscribe(o => this.isMobile = o.matches)
        )
    }

    selectComplaint(complaint: Complaint) {
        this.selectedComplaint = complaint;
        this.complaintDialogVisible = true;
    }

    openSearchPanel() {
        this.searchVisible = true
    }

    ngOnDestroy(): void {
        this.listLoader.unsubscribe()
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }
}
