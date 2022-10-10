import {LoadingController} from "./loading-controller";
import {LoadingHandler} from "../../../interfaces/pageing/loading-handler";
import {FilterChipsValue, FilterRequestParams, Pageable} from "../../../interfaces/pageing/pageable";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {debounceTime, distinctUntilChanged, map, Subject, Subscription, tap} from "rxjs";
import {updateListResolver} from "../../../method/update_resolver";
import {genericParams} from "../../paging-load-service";
import {reduceToStringObject} from "../../../method/object";
import {LazyLoadEvent} from "primeng/api";
import loader from "@angular-devkit/build-angular/src/webpack/plugins/single-test-transform";

const DEBOUNCE_INPUT_TIME = 1000;

export class ListLoader<T> extends LoadingController<T> implements LoadingHandler<T> {
    private query: Params = {};

    constructor(loader: Pageable<T>, query: Params) {
        super(loader);

        this.elements = Array.from({length: 100})
        this.first = 0;
        this.rows = 30;
        this.query = {...query, offset: this.first, limit: this.rows};

        this.subscriptions = this.loader.liveUpdateProvides().map((observable, index) => observable.subscribe(provider => {
                if (this.loader.preventUpdate(provider, this.query)[index]()) return;
                this.elements = updateListResolver(this.elements, this.loader.liveUpdateIdentificationFields()[index], provider);
            }
        ))
    }

    public load(query: Params) {
        this.query = {...query, offset: this.first, limit: this.rows};
        this.loadingHandler(this.loader.queryToMatchingObject(this.query))
    }

    public limitUpdate(event: LazyLoadEvent) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 30;
        this.query = {...this.query, offset: this.first, limit: this.rows};
        this.loadingHandler(this.loader.queryToMatchingObject(this.query))
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
}
