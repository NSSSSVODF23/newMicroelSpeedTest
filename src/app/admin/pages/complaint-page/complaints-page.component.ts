import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, Subject, Subscription} from "rxjs";
import {House} from "../../../common/transport/models/house";
import {LazyLoadEvent} from "primeng/api";
import {HouseService} from "../../service/house.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Complaint} from "../../../common/transport/models/complaint";
import {ComplaintService} from "../../service/complaint.service";
import {dateSorting, updateListResolver} from "../../../common/method/update_resolver";
import {ComplaintsFilter} from "../../../common/transport/filters/complaint-filter";
import {UpdateProvider} from "../../../common/transport/models/update-provider";
import {ListMutationTypes} from "../../../common/transport/enums/list-mutation-types";
import {VirtualScroller} from "primeng/virtualscroller";
import {ExtendDate} from "../../../common/method/time";
import {stringToInt} from "../../../common/method/math";
import {SearchObserver} from "../../../common/observers/search_observer";

@Component({
    templateUrl: './complaints-page.component.html',
    styleUrls: ['./complaints-page.component.scss']
})
export class ComplaintsPageComponent implements OnInit, OnDestroy {
    @ViewChild("scroller") scroller?: VirtualScroller;
    complaints: Complaint[] = Array.from({length: 30});

    selectedComplaint?: Complaint;
    complaintDialogVisible = false;

    rows = 30;

    filterDateRangeValue: Date[] = [];
    searchFilters: ComplaintsFilter = {
        login: undefined,
        phone: undefined,
        ip: undefined,
        mac: undefined,
        address: undefined,
        start: undefined,
        end: undefined,
        processed: undefined
    };
    searchObserver: SearchObserver<ComplaintsFilter> = new SearchObserver();

    houseList: House[] = [];

    ipInputFilter: RegExp = /^[\d\.]+$/;
    macInputFilter: RegExp = /^[\da-f:]+$/;
    processedStatuses = [
        {status: true, name: 'Обработанные'},
        {status: false, name: 'Необработанные'},
        {status: undefined, name: 'Все'},
    ];

    subscriptions: Subscription[] = [];

    constructor(
        readonly complaint: ComplaintService,
        readonly house: HouseService,
        readonly router: Router,
        readonly route: ActivatedRoute
    ) {
    }

    addressResetFunction(options: any) {
        this.searchFilters.address = undefined;
        this.searchObserver.next(Object.assign({}, this.searchFilters));
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.setCalendarDate(params)
            this.searchFilters = {
                login: params["login"],
                ip: params["ip"],
                mac: params["mac"],
                processed: params["processed"] === undefined ? undefined : (params["processed"] === 'true'),
                phone: params["phone"],
                address: params['address'] ? parseInt(params['address']) : undefined,
                start: params["start"],
                end: params["end"]
            };
            this.complaint
                .getComplaints(this.searchFilters)
                .subscribe((complaints) => {
                    this.complaints = Array.from({length: complaints[1]})
                    this.complaints.splice(0, this.rows, ...complaints[0]);
                    this.complaints = [...this.complaints];
                });
        })
        this.searchObserver
            .subscribe({
                next: (filter) => {
                    const filtersWithoutPaginate = {...filter}
                    delete filtersWithoutPaginate.first
                    delete filtersWithoutPaginate.rows
                    this.complaints = Array.from({length: this.rows});
                    this.router.navigate(['admin', 'complaints'], {queryParams: filtersWithoutPaginate})
                }
            });
        this.house.getAllHouses().subscribe((houses) => {
            this.houseList = [
                {address: "Все дома", houseId: undefined, vlan: 0},
                ...houses.data?.getAllHouses,
            ];
        });
        this.subscriptions.push(
            this.complaint.updateComplaints().subscribe(update => {
                if (!update.object || this.revertAdding(update)) return;
                this.complaints = dateSorting(updateListResolver(this.complaints, 'complaintId', update), 'created', 'desc');
            }))
    }

    revertAdding(update: UpdateProvider<Complaint>) {
        if (update.updateType === ListMutationTypes.ADD) {
            const isProcessed = !!update.object?.processed;
            if (this.searchFilters.phone && !update.object?.phone?.includes(this.searchFilters.phone)) return true;
            if (this.searchFilters.login && !update.object?.session?.login?.includes(this.searchFilters.login)) return true;
            if (this.searchFilters.address && update.object?.session?.house?.houseId !== this.searchFilters.address) return true;
            if (this.searchFilters.ip && !update.object?.session?.ip?.includes(this.searchFilters.ip)) return true;
            if (this.searchFilters.mac && !update.object?.session?.mac?.includes(this.searchFilters.mac)) return true;
            if ((this.searchFilters.start && new Date(this.searchFilters.start).getTime() > new Date(update.object?.created ?? 0).getTime()) ||
                (this.searchFilters.end && new Date(this.searchFilters.end).getTime() < new Date(update.object?.created ?? 0).getTime())) return true;
            if (this.searchFilters.processed && this.searchFilters.processed !== isProcessed) return true;
        }
        return false;
    }

    filterChangeHandler(event: any) {
        setTimeout(() => this.searchObserver.next(Object.assign({}, this.searchFilters)), 0);
    }

    filterChangeDateRangeHandler(event: Date[]) {
        if (event && event[0] && event[1]) {
            this.searchFilters.start = ExtendDate.of(event[0]).getFormatted();
            this.searchFilters.end = ExtendDate.of(event[1]).getEndDay().getFormatted();
            this.searchObserver.next(Object.assign({}, this.searchFilters));
        } else {
            this.searchFilters.start = undefined;
            this.searchFilters.end = undefined;
            this.searchObserver.next(Object.assign({}, this.searchFilters));
        }
    }

    setCalendarDate(query: any) {
        if (query['start']) {
            this.filterDateRangeValue[0] = new Date(query['start']);
            if (query['end']) {
                this.filterDateRangeValue[1] = new Date(query['end']);
            }
        }
    }

    loadComplaints(event: LazyLoadEvent) {
        this.searchFilters.first = event.first;
        this.searchFilters.rows = event.rows;
        this.complaint
            .getComplaints(this.searchFilters)
            .subscribe((complaints) => {
                this.complaints = Array.from({length: complaints[1]})
                this.complaints.splice(event.first ?? 0, event.rows ?? this.rows, ...complaints[0]);
                this.complaints = [...this.complaints];
            });
    }

    resetFilters() {
        this.searchFilters = {
            login: undefined,
            phone: undefined,
            processed: undefined,
            ip: undefined,
            mac: undefined,
            address: undefined,
            start: undefined,
            end: undefined,
        };
        this.filterDateRangeValue = [];
        this.searchObserver.next(Object.assign({}, this.searchFilters));
    }

    selectComplaint(complaint: Complaint) {
        this.selectedComplaint = complaint;
        this.complaintDialogVisible = true;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }
}
