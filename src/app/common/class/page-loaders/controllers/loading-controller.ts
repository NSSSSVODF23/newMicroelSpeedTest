import {Pageable} from "../../../interfaces/pageing/pageable";
import {Subscription} from "rxjs";
import {reduceToStringObject} from "../../../method/object";
import {genericParams} from "../../paging-load-service";

export class LoadingController<T> {
    public elements: T[] = [];
    public totalElements: number = 0;
    public first = 0;
    public rows = 10;
    protected loader: Pageable<T>;
    protected isInit = false;
    protected subscriptions: Subscription[] = [];

    constructor(loader: Pageable<T>) {
        this.loader = loader;
    }

    protected static equaling(prev: genericParams, curr: genericParams) {
        return JSON.stringify(prev) === JSON.stringify(curr);
    }

    protected static emptyFiltering(query: genericParams) {
        return Object.entries(query).filter(([k, v]) => v !== undefined && v !== "").reduce(reduceToStringObject, {} as genericParams)
    }

    public unsubscribe() {
        this.subscriptions.forEach(value => value.unsubscribe())
        this.subscriptions = [];
    }
}
