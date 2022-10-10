import {FilterChipsValue, FilterRequestParams, Pageable} from '../interfaces/pageing/pageable'
import {debounceTime, distinctUntilChanged, iif, map, Observable, Subject, Subscription, takeWhile, tap} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {LazyLoadEvent} from "primeng/api";
import {QueryLimit} from "../transport/models/query-limit";
import {deepCopy, reduceToStringObject} from "../method/object";
import {updateListResolver} from "../method/update_resolver";
import {Calendar, ExtendDate} from "../method/time";

export type genericParams = { [key: string]: any }

const DEBOUNCE_INPUT_TIME = 1000;

export class PagingLoadService<T> {
    public elements: T[] = [];
    public totalElements: number = 0;
    public first = 0;
    public rows = 10;
    public filterChips: FilterChipsValue[] = [];
    private readonly target: string[];
    private query: Params = {};
    private inputValues: genericParams = {}
    private updateSubject: Subject<genericParams> = new Subject();
    private loader: Pageable<T>;
    private router: Router;
    private route: ActivatedRoute;
    private subscriptions: Subscription[] = [];
    private isInit = false;
    private readonly isVirtualScroll: boolean;

    constructor(loader: Pageable<T>, router: Router, route: ActivatedRoute, target: string[], isVirtualScroll = false) {
        this.loader = loader;
        this.router = router;
        this.route = route;
        this.target = target;
        this.isVirtualScroll = isVirtualScroll;

        if (isVirtualScroll) {
            this.elements = Array.from({length: 100})
            this.rows = 40
            if (this.param()['offset'] === undefined || !this.param()['limit'] || this.param()['limit'] < 30) {
                this.inputValues['offset'] = 0;
                this.inputValues['limit'] = 30;
                this.router.navigate(target, {
                    queryParams: {
                        offset: this.inputValues['offset'],
                        limit: this.inputValues['limit']
                    }, queryParamsHandling: "merge"
                }).then()
            }
        }

        this.route.queryParams.pipe(tap(params => {
            this.inputValues = this.loader.queryToInputModels(params)
            this.filterChips = this.loader.queryToChips(params, this.removeFilter.bind(this))
            this.query = {...params}
        }), map(loader.queryToMatchingObject)).subscribe(this.loadingHandler.bind(this))

        this.updateSubject.pipe(
            debounceTime(DEBOUNCE_INPUT_TIME),
            distinctUntilChanged(PagingLoadService.equaling),
            map(PagingLoadService.emptyFiltering)
        ).subscribe(this.filterApply.bind(this))

        this.subscriptions = this.loader.liveUpdateProvides().map((observable, index) => observable.subscribe(provider => {
                if (this.loader.preventUpdate(provider, this.inputValues)[index]()) return;
                this.elements = updateListResolver(this.elements, this.loader.liveUpdateIdentificationFields()[index], provider, this.loader.liveUpdateIdentificationFields()[index] !== "beginningId" && !this.isVirtualScroll);
            }
        ))
    }

    private static equaling(prev: genericParams, curr: genericParams) {
        return JSON.stringify(prev) === JSON.stringify(curr);
    }

    private static emptyFiltering(query: genericParams) {
        return Object.entries(query).filter(([k, v]) => v !== undefined && v !== "").reduce(reduceToStringObject, {} as genericParams)
    }

    public removeFilter(name: string) {
        delete this.inputValues[name]
        this.router.navigate(this.target, {
            queryParams: this.inputValues
        }).then()
    }

    public filterClean() {
        this.inputValues = Object.entries(this.inputValues)
            .map(([k, v]) => k === "offset" || k === "limit" ? [k, v] as [string, string] : [k, undefined] as [string, undefined])
            .reduce(reduceToStringObject, {} as genericParams);

        this.router.navigate(this.target, {
            queryParams: this.inputValues
        }).then()
    }

    public param() {
        return this.inputValues
    }

    public update(value: any, queryParamName: string) {
        const handler = this.loader.inputModelToQueryParamHandlers()[queryParamName]
        if (!handler) throw new Error(`Параметра для фильтрации ${queryParamName} нет. Доступные параметры ${Object.keys(this.loader.inputModelToQueryParamHandlers()).join(", ")}.`)
        if (value === undefined || value === null) {
            this.query[queryParamName] = handler(undefined);
        } else {
            this.query[queryParamName] = handler(value)
        }
        if (this.isVirtualScroll) this.elements = Array.from({length: 100});
        this.updateSubject.next(Object.assign({}, this.query));
    }

    public limitUpdate(event: LazyLoadEvent) {
        this.inputValues['offset'] = event.first;
        this.inputValues['limit'] = event.rows;

        if (this.isVirtualScroll) {
            this.first = event.first ?? 0
            this.rows = event.rows ?? 30
        }

        if (this.isInit) {
            this.router.navigate(this.target, {
                queryParams: {
                    offset: this.inputValues['offset'],
                    limit: this.inputValues['limit']
                }, queryParamsHandling: "merge"
            }).then();
        }

        if (!this.isInit) {
            this.isInit = true;
        }
    }

    public unsubscribe() {
        this.subscriptions.forEach(value => value.unsubscribe())
        this.subscriptions = [];
    }

    private filterApply(query: genericParams) {
        query['offset'] = '0';
        this.router.navigate(this.target, {queryParams: query}).then();
    }

    private loadingHandler(filter: FilterRequestParams<T>) {
        if (this.isVirtualScroll) {
            this.loader.loader(filter).subscribe(
                data => {
                    this.elements = Array.from({length: data.totalElements})
                    this.elements.splice(this.first, this.rows, ...data.content);
                    this.elements = [...this.elements]
                    this.totalElements = data.totalElements;
                }
            )
        } else {
            this.elements = Array.from({length: filter.limits.limit})
            this.loader.loader(filter).subscribe(
                data => {
                    this.elements = [];
                    setTimeout(
                        () => {
                            this.elements = deepCopy(data.content);
                            this.totalElements = data.totalElements;
                        }, 0)
                }
            )
        }
    }
}
