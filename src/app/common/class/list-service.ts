import {FilterRequestParams, Pageable} from '../interfaces/pageable'
import {debounceTime, distinctUntilChanged, map, Subject, Subscription, tap} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {LazyLoadEvent} from "primeng/api";
import {QueryLimit} from "../transport/models/query-limit";
import {deepCopy, reduceToStringObject} from "../method/object";
import {updateListResolver} from "../method/update_resolver";
import {Calendar, ExtendDate} from "../method/time";

type genericParams = { [key: string]: any }
type genericMethods = { [key: string]: (value: any) => void }

const DEBOUNCE_INPUT_TIME = 1000;

export class ListService<T> {
    public elements: T[] = [];
    public totalElements: number = 0;
    public loading = true;
    public first = 0;
    public rows = 10;
    private readonly target: string[];
    private query: Params = {};
    private inputValues: genericParams = {}
    private updateSubject: Subject<genericParams> = new Subject();
    private loader: Pageable<T>;
    private router: Router;
    private route: ActivatedRoute;
    private subscriptions: Subscription[] = [];
    private isInit = false;

    constructor(loader: Pageable<T>, router: Router, route: ActivatedRoute, target: string[]) {
        this.loader = loader;
        this.router = router;
        this.route = route;
        this.target = target;

        this.route.queryParams.pipe(tap(params => {
            this.inputValues = this.loader.inputValues(params)
            this.query = {...params}
        }), map(loader.matchingObject)).subscribe(this.loadingHandler.bind(this))

        this.updateSubject.pipe(
            debounceTime(DEBOUNCE_INPUT_TIME),
            distinctUntilChanged(ListService.equaling),
            map(ListService.emptyFiltering)
        ).subscribe((query) => {
            query['offset'] = '0';
            this.router.navigate(target, {queryParams: query}).then();
        })

        this.subscriptions = this.loader.listUpdaters().map((observable, index) => observable.subscribe(provider => {
                if (this.loader.preventUpdate(provider, this.inputValues)[index]()) return;
                this.elements = updateListResolver(this.elements, this.loader.updateIds()[index], provider)
            }
        ))
    }


    private static equaling(prev: genericParams, curr: genericParams) {
        return JSON.stringify(prev) === JSON.stringify(curr);
    }

    private static emptyFiltering(query: genericParams) {
        return Object.entries(query).filter(([k, v]) => v !== undefined && v !== "").reduce(reduceToStringObject, {} as genericParams)
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
        const handler = this.loader.updateHandlers()[queryParamName]
        if (!handler) throw new Error(`Параметра для фильтрации ${queryParamName} нет. Доступные параметры ${Object.keys(this.loader.updateHandlers()).join(", ")}.`)
        if (value === undefined || value === null) {
            this.query[queryParamName] = handler(undefined);
        } else {
            this.query[queryParamName] = handler(value)
        }
        this.updateSubject.next(Object.assign({}, this.query));
    }

    public limitUpdate(event: LazyLoadEvent) {
        if (!this.isInit) {
            this.isInit = true;
            return;
        }

        this.inputValues['offset'] = event.first;
        this.inputValues['limit'] = event.rows;

        this.router.navigate(this.target, {
            queryParams: {
                offset: this.inputValues['offset'],
                limit: this.inputValues['limit']
            }, queryParamsHandling: "merge"
        }).then();
    }

    public unsubscribe() {
        this.subscriptions.forEach(value => value.unsubscribe())
        this.subscriptions = [];
    }

    private loadingHandler(filter: FilterRequestParams<T>) {
        this.loading = true;
        this.loader.pageLoader(filter).subscribe(
            data => {
                this.loading = false;
                this.elements = deepCopy(data.content);
                this.totalElements = data.totalElements;
            }
        )
    }
}