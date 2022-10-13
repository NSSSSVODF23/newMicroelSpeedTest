import {TestingRequest} from "../../interfaces/testing-request";
import {Observable, Subject} from "rxjs";

const HOSTNAME = location.hostname;
const PORT = location.port;

export class DownloadTestingRequest implements TestingRequest {
    private activeRequests: { request: XMLHttpRequest, isRun: boolean, byteLoaded: number }[] = [];
    private updater = new Subject<number>();
    private run = true;
    private first = true;
    private endTime?: number = Number.MAX_VALUE;
    private intervalIndex: any;
    private readonly testingTime;
    private isEnded = false;

    constructor(testingTime = 15300) {
        this.testingTime = testingTime;
        this.getObserver().subscribe({
            complete: () => {
                if (this.isEnded) this.endTestEvent()
            }
        })
    }

    getIsEnded(): boolean {
        return this.isEnded
    }

    getName(): string {
        return "DownloadTestingRequest"
    }

    getObserver(): Observable<number> {
        return this.updater.asObservable();
    }

    sendRequest(): void {
        if (!this.first && this.endTime && this.endTime < Date.now()) {
            this.endTestEvent()
            this.abort()
        }
        if (!this.run) return;

        const requestWrapper = {request: new XMLHttpRequest(), isRun: true, byteLoaded: 0}; // Создаем запрос
        this.activeRequests.push(requestWrapper);

        requestWrapper.request.open(
            "POST",
            `http://${HOSTNAME}:${PORT}/public/download?deviceId=${localStorage.getItem(
                "deviceId",
            )}`,
        ); // Устанавливаем параметры запроса

        // Обработчик получения количества загруженных байт
        requestWrapper.request.onprogress = (event) => {
            requestWrapper.byteLoaded = event.loaded;
            if (this.first) {
                this.first = false;
                this.endTime = Date.now() + this.testingTime;
                this.intervalIndex = setInterval(() => {
                    this.updater.next(this.activeRequests.map(rw => rw.byteLoaded).reduce((a, b) => a + b, 0))
                    if (!this.first && this.endTime && this.endTime < Date.now()) {
                        this.isEnded = true;
                        this.abort();
                    }
                }, 150)
            }
            if (this.activeRequests.map(rw => rw.isRun).filter(isRun => isRun).length < 2 && event.loaded > 50_000_000 / 2) this.sendRequest();
        };

        requestWrapper.request.onloadend = () => {
            requestWrapper.isRun = false;
        }

        requestWrapper.request.onerror = () => {
            this.updater.error("Произошла ошибка в соединении с сервером тестирования скорости скачивания.");
        } // Обработчик ошибки

        requestWrapper.request.send(); // Отправляем запрос
    }

    abort(): void {
        this.run = false;
        this.activeRequests.filter(rw => rw.isRun).forEach(rw => rw.request.abort());
        if (!this.updater.closed) this.updater.complete();
        clearInterval(this.intervalIndex);
    }

    setEndTestHandler(handler: () => void): void {
        this.endTestEvent = handler;
    }

    private endTestEvent = () => {
    };
}
