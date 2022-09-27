import {Observable} from "rxjs";
import {Page} from "../transport/models/page";
import {Params} from "@angular/router";
import {QueryLimit} from "../transport/models/query-limit";
import {UpdateProvider} from "../transport/models/update-provider";

export interface FilterRequestParams<T> {
    matchingObject: T;
    limits: QueryLimit;
    extras?: { [key: string]: string | undefined }
}

export interface Pageable<T> {
    pageLoader(filter: FilterRequestParams<T>): Observable<Page<T>>;

    matchingObject(params: Params): FilterRequestParams<T>

    inputValues(params: Params): { [key: string]: any }

    updateHandlers(): { [key: string]: (value: any) => string | undefined }

    listUpdaters(): Observable<UpdateProvider<T>>[]

    preventUpdate(provider: UpdateProvider<T>, filter: { [key: string]: string | undefined }): (() => boolean)[]

    updateIds(): string[];
}