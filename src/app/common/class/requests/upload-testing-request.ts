import {TestingRequest} from "../../interfaces/testing-request";
import {Observable, Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {UploadParticle} from "../speed-counter";

const HOSTNAME = location.hostname;
const PORT = "8080";

export class UploadTestingRequest implements TestingRequest {
    private activeRequests: { request: XMLHttpRequest, isEnd: boolean }[] = [];
    private updater = new Subject<UploadParticle | number>();
    private webSocket = webSocket<UploadParticle>({
        url: `ws://${HOSTNAME}:${PORT}/upload/${localStorage.getItem(
            "deviceId",
        )}`,
    });
    private first = true;
    private run = true;
    private SIZE_OF_REQUEST = 50 * 16; // Считаем количество чанков для загрузки
    private data: ArrayBuffer[] = []; // Объявляем переменную для хранения данных
    private SIZE = 65536; // Количество байт в одном чанке
    private isBreak = false; // Если закончился предыдущий запрос, но не начался новый
    private updateIndex = 0; // Текущее количество обновлений в текущем запросе
    private endTimePreviousRequest: number = 0; // Конец предыдущего запроса
    private decreaseTimeSum = 0;
    private lastParticle?: UploadParticle;

    constructor() {
        for (let index = 0; index < this.SIZE_OF_REQUEST; index++) {
            this.data.push(new ArrayBuffer(this.SIZE)); // Заполняем массив данными
        }
        this.getObserver().subscribe({
            complete: () => setTimeout(() => this.endTestEvent(), 0)
        })
    }

    abort(): void {
        this.run = false;
        this.activeRequests.filter(rw => !rw.isEnd).forEach(rw => rw.request.abort())
        this.updater.complete()
        this.webSocket.complete()
    }

    getObserver(): Observable<UploadParticle | number> {
        return this.updater.asObservable();
    }

    sendRequest(): void {
        if (!this.run) return;
        if (this.first) {
            this.connectToSocket()
            this.first = false;
            this.endTimePreviousRequest = Date.now();
        }

        const requestWrapper = {request: new XMLHttpRequest(), isEnd: false};

        // Устанавливаем параметры запроса
        requestWrapper.request.open(
            "POST",
            `http://${HOSTNAME}:${PORT}/public/upload?deviceId=${localStorage.getItem(
                "deviceId",
            )}`,
        );

        // Устанавливаем обработчик ошибки
        requestWrapper.request.upload.onerror = () => {
            this.run = false;
            this.activeRequests.filter(rw => !rw.isEnd).forEach(rw => rw.request.abort())
            this.updater.error("Произошла ошибка в соединении с сервером тестирования скорости загрузки.");
            this.webSocket.complete();
        };

        requestWrapper.request.upload.onprogress = ev => {
            if (this.activeRequests.filter(rw => !rw.isEnd).length < 2 && ev.loaded > 50_000_000 / 2) this.sendRequest()
        }

        // Обрабатываем конец нового запроса
        requestWrapper.request.upload.onloadend = () => {
            requestWrapper.isEnd = true;
        };

        // Отправляем запрос
        requestWrapper.request.send(
            new Blob(this.data, {type: "application/octet-stream"}),
        );
        this.activeRequests.push(requestWrapper);
    }

    setEndTestHandler(handler: () => void): void {
        this.endTestEvent = handler;
    }

    getName(): string {
        return "UploadTestingRequest";
    }

    private endTestEvent = () => {
    }

    private connectToSocket() {
        this.webSocket.subscribe({
            next: (value) => {
                this.lastParticle = value;
                if (this.endTimePreviousRequest !== 0) {
                    this.decreaseTimeSum -= (Date.now() - this.endTimePreviousRequest) - 150 * 2;
                    value.e += this.decreaseTimeSum;
                    this.updater.next({...value});
                    this.endTimePreviousRequest = 0; // Обнуляем время конца предыдущего запроса
                } else {
                    // Если нет, то просто обновляем
                    value.e += this.decreaseTimeSum;
                    this.updater.next({...value});
                }
                // Если пакет определен и время его получение превышает таймаут, то прерываем тест
                if (value.e > 15000) {
                    this.abort()
                }
            },
            error: err => {
                this.run = false;
                this.activeRequests.filter(rw => !rw.isEnd).forEach(rw => rw.request.abort())
                this.updater.error("Потеряно соединение с сокет сервером, при тестировании скорости загрузки.");
            }
        })
    }
}
