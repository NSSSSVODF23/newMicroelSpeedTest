import {TestingStage} from "../transport/enums/testing-stage";
import {Observable} from "rxjs";

export interface TestingRequest {
    getObserver(): Observable<{ bytes: number, decreaseTime: number } | number>

    sendRequest(): void
}