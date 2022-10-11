import {TestingRequest} from "../../interfaces/testing-request";
import {Observable, Subject} from "rxjs";

const HOSTNAME = location.hostname;
const PORT = "8080";

export class DownloadTestingRequest implements TestingRequest {
    private request = new XMLHttpRequest();
    private updater = new Subject<number>();
    private byteCounterBuffer: number[] = [];
    private requestIndex = 0;
    private run = true;
    private first = true;
    private endTime?: number = Number.MAX_VALUE;
    private intervalIndex: any;
    private readonly testingTime;

    constructor(testingTime = 15300) {
        this.testingTime = testingTime;
    }

    getName(): string {
        return "DownloadTestingRequest"
    }

    getObserver(): Observable<number> {
        return this.updater.asObservable();
    }

    sendRequest(): void {
        if (!this.first && this.endTime && this.endTime < Date.now()) {
            this.onEndTest()
            this.abort()
        }
        if (!this.run) return;
        this.request = new XMLHttpRequest(); // Создаем запрос

        this.request.open(
            "POST",
            `http://${HOSTNAME}:${PORT}/public/download?deviceId=${localStorage.getItem(
                "deviceId",
            )}`,
        ); // Устанавливаем параметры запроса

        // Обработчик получения количества загруженных байт
        this.request.onprogress = (event) => {
            this.byteCounterBuffer[this.requestIndex] = event.loaded;
            if (this.first) {
                this.first = false;
                this.endTime = Date.now() + this.testingTime;
                this.intervalIndex = setInterval(() => {
                    this.updater.next(this.byteCounterBuffer.reduce((a, b) => a + b, 0))
                    if (!this.first && this.endTime && this.endTime < Date.now()) {
                        this.onEndTest()
                        this.abort();
                    }
                }, 150)
            }
        };

        this.request.onloadend = () => {
            this.requestIndex++;
            this.sendRequest();
        }

        this.request.onerror = () => {
            this.updater.error("Произошла ошибка в соединении с сервером тестирования скорости скачивания.");
        } // Обработчик ошибки

        this.request.send(); // Отправляем запрос
    }

    abort(): void {
        this.run = false;
        this.request.abort();
        if (!this.updater.closed) this.updater.complete();
        clearInterval(this.intervalIndex);
    }

    setEndTestHandler(handler: () => void): void {
        this.onEndTest = handler;
    }

    private onEndTest = () => {
    };
}
