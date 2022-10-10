import {FilterRequestParams} from "./pageable";
import {LazyLoadEvent} from "primeng/api";

export interface LoadingHandler<T> {
    loadingHandler(filter: FilterRequestParams<T>): void;

    limitUpdate(event: LazyLoadEvent): void;
}
