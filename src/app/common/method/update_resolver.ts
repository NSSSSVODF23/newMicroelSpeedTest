import {UpdateProvider} from "../transport/models/update-provider";
import {ListMutationTypes} from "../transport/enums/list-mutation-types";

export function updateListResolver(list: any[], idFieldName: string, updateProviderItem: UpdateProvider<any>): any[] {
    switch (updateProviderItem.updateType) {
        case ListMutationTypes.ADD:
            if (list.every(value => value[idFieldName] !== updateProviderItem.object[idFieldName])) {
                list.unshift(updateProviderItem.object)
                return [...list];
            }
            return list;
        case ListMutationTypes.UPDATE:
            return list.map(value => {
                if (value === undefined) return undefined;
                if (value[idFieldName] === updateProviderItem.object[idFieldName]) {
                    return updateProviderItem.object
                } else {
                    return value;
                }
            })
        case ListMutationTypes.DELETE:
            return list.filter(value => {
                return value[idFieldName] !== updateProviderItem.object[idFieldName]
            });
    }
}

type sortDirection = 'asc' | 'desc';

function postSorting(list: any[], direction: sortDirection, sortFn: (a: any, b: any) => number) {
    if (direction === 'asc') {
        return list.sort((a, b) => sortFn(a, b));
    } else if (direction === 'desc') {
        return list.sort((a, b) => sortFn(b, a));
    }
    return list;
}

export function idSorting(list: any[], sortingField: string, direction: sortDirection) {
    return postSorting(list, direction, (a, b) => {
        return a[sortingField] - b[sortingField];
    })
}

export function dateSorting(list: any[], sortingField: string, direction: sortDirection) {
    return postSorting(list, direction, (a, b) => {
        const aDate = new Date(a[sortingField]);
        const bDate = new Date(b[sortingField]);
        return aDate.getTime() - bDate.getTime();
    })
}