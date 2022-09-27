import {debounceTime, distinctUntilChanged, map, Observable, Observer, pipe, Subject} from "rxjs";

export class SearchObserver<T> {
    private subject = new Subject<T>();

    public next(value: T) {
        this.subject.next(value);
    }

    public subscribe(observer?: Partial<Observer<T>> | undefined) {
        return this.subject.pipe(
            debounceTime(1000),
            distinctUntilChanged((prev, curr) => {
                return JSON.stringify(prev) === JSON.stringify(curr);
            }),
            map((filter: { [key: string]: any }) => {
                const copy = {...filter};
                for (let filterKey in copy) {
                    if (copy[filterKey] === "") copy[filterKey] = undefined;
                }
                console.log(filter, copy);
                return <T>copy;
            })
        ).subscribe(observer);
    }
}