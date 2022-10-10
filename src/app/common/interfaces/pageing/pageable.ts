import {Observable} from "rxjs";
import {Page} from "../../transport/models/page";
import {Params} from "@angular/router";
import {QueryLimit} from "../../transport/models/query-limit";
import {UpdateProvider} from "../../transport/models/update-provider";

export interface FilterChipsValue {
    name: string;
    value: string;
    remove: () => void;
}

export interface FilterRequestParams<T> {
    matchingObject: T;
    limits: QueryLimit;
    extras?: { [key: string]: any }
}

export interface Pageable<T> {
    loader(filter: FilterRequestParams<T>): Observable<Page<T>>;

    queryToMatchingObject(params: Params): FilterRequestParams<T>

    queryToInputModels(params: Params): { [key: string]: any }

    queryToChips(params: Params, removeFilter: (name: string) => void): FilterChipsValue[];

    inputModelToQueryParamHandlers(): { [key: string]: (value: any) => string | undefined }

    liveUpdateProvides(): Observable<UpdateProvider<T>>[]

    preventUpdate(provider: UpdateProvider<T>, filter: Params): (() => boolean)[]

    liveUpdateIdentificationFields(): string[];
}
