import {LoadingController} from "./loading-controller";
import {LoadingHandler} from "../../../interfaces/pageing/loading-handler";
import {FilterChipsValue, FilterRequestParams, Pageable} from "../../../interfaces/pageing/pageable";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {debounceTime, distinctUntilChanged, map, Subject, Subscription, tap} from "rxjs";
import {updateListResolver} from "../../../method/update_resolver";
import {genericParams} from "../../paging-load-service";
import {deepCopy, reduceToStringObject} from "../../../method/object";
import {LazyLoadEvent} from "primeng/api";

const DEBOUNCE_INPUT_TIME = 1000;

export class ListQueryLoader<T> extends LoadingController<T> implements LoadingHandler<T> {

    public filterChips: FilterChipsValue[] = [];
    private readonly target: string[];
    private query: Params = {};
    private inputValues: genericParams = {}
    private updateSubject: Subject<genericParams> = new Subject();
    private router: Router;
    private route: ActivatedRoute;

    constructor(loader: Pageable<T>, router: Router, route: ActivatedRoute, target: string[]) {
        super(loader);
        this.router = router;
        this.route = route;
        this.target = target;

        this.elements = Array.from({length: 100})
        this.first = 0;
        this.rows = 30;

        this.route.queryParams.pipe(tap(params => {
            this.inputValues = this.loader.queryToInputModels(params)
            this.filterChips = this.loader.queryToChips(params, this.filterRemove.bind(this))
            this.query = {...params}
        }), map(loader.queryToMatchingObject)).subscribe(this.loadingHandler.bind(this))

        this.updateSubject.pipe(
            debounceTime(DEBOUNCE_INPUT_TIME),
            distinctUntilChanged(LoadingController.equaling),
            map(LoadingController.emptyFiltering)
        ).subscribe(this.filterApply.bind(this))

        this.subscriptions = this.loader.liveUpdateProvides().map((observable, index) => observable.subscribe(provider => {
                if (this.loader.preventUpdate(provider, this.inputValues)[index]()) return;
                this.elements = updateListResolver(this.elements, this.loader.liveUpdateIdentificationFields()[index], provider);
            }
        ))
    }

    public filterRemove(name: string) {
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
        this.elements = Array.from({length: 100});
        if (value === undefined || value === null) {
            this.query[queryParamName] = handler(undefined);
        } else {
            this.query[queryParamName] = handler(value)
        }
        this.updateSubject.next(Object.assign({}, this.query));
    }

    public limitUpdate(event: LazyLoadEvent) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 30;
        this.inputValues['offset'] = this.first;
        this.inputValues['limit'] = this.rows;

        this.router.navigate(this.target, {
            queryParams: {
                offset: this.inputValues['offset'],
                limit: this.inputValues['limit']
            }, queryParamsHandling: "merge"
        }).then();
    }

    loadingHandler(filter: FilterRequestParams<T>): void {
        this.loader.loader(filter).subscribe(
            data => {
                this.elements = Array.from({length: data.totalElements})
                this.elements.splice(this.first, this.rows, ...data.content);
                this.elements = [...this.elements]
                this.totalElements = data.totalElements;
            }
        )
    }

    private filterApply(query: genericParams) {
        this.first = 0
        this.router.navigate(this.target, {queryParams: query}).then();
    }
}
