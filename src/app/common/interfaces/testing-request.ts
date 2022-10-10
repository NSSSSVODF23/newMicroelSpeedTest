import {TestingStage} from "../transport/enums/testing-stage";
import {Observable} from "rxjs";
import {UploadParticle} from "../class/speed-counter";

export interface TestingRequest {
    getObserver(): Observable<UploadParticle | number>

    sendRequest(): void

    abort(): void

    setEndTestHandler(handler: () => void): void

    getName(): string;
}
