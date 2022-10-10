import {TestingRequest} from "../../interfaces/testing-request";
import {Observable, Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {UploadParticle} from "../speed-counter";
import {TestingStage} from "../../transport/enums/testing-stage";

const HOSTNAME = location.hostname;
const PORT = "8080";

export class UploadTestingRequest implements TestingRequest {
    private request = new XMLHttpRequest(); // Объявляем новый запрос
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
    private isBreak = true; // Если закончился предыдущий запрос, но не начался новый
    private updateIndex = 0; // Текущее количество обновлений в текущем запросе
    private endTimePreviousRequest: number = 0; // Конец предыдущего запроса
    private decreaseTimeSum = 0;
    private lastParticle?: UploadParticle;

    constructor() {
        for (let index = 0; index < this.SIZE_OF_REQUEST; index++) {
            this.data.push(new ArrayBuffer(this.SIZE)); // Заполняем массив данными
        }
    }

    abort(): void {
        this.run = false;
        this.request.abort()
        if (!this.updater.closed) this.updater.complete()
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

        this.request = new XMLHttpRequest();

        // Устанавливаем параметры запроса
        this.request.open(
            "POST",
            `http://${HOSTNAME}:${PORT}/public/upload?deviceId=${localStorage.getItem(
                "deviceId",
            )}`,
        );

        // Устанавливаем обработчик ошибки
        this.request.upload.onerror = () => {
            this.run = false;
            this.request.abort()
            this.updater.error("Произошла ошибка в соединении с сервером тестирования скорости загрузки.");
            this.webSocket.complete();
        };

        // Обрабатываем начало нового запроса
        this.request.upload.onprogress = () => {
            if (this.isBreak) {
                // Если флаг прерывания
                this.isBreak = false; // Отключаем флаг прерывания
            }
        };

        // Обрабатываем конец нового запроса
        this.request.upload.onloadend = () => {
            this.isBreak = true; // Устанавливаем флаг прерывания
            this.endTimePreviousRequest = Date.now(); // Устанавливаем время конца текущего запроса
            this.updateIndex = 0; // Обнуляем количество обновлений
            this.sendRequest(); // Начинаем новый запрос
        };

        // Отправляем запрос
        this.request.send(
            new Blob(this.data, {type: "application/octet-stream"}),
        );
    }

    setEndTestHandler(handler: () => void): void {
        this.onEndTest = handler;
    }

    getName(): string {
        return "UploadTestingRequest";
    }

    private onEndTest = () => {
    }

    private connectToSocket() {
        this.webSocket.subscribe({
            next: (value) => {
                this.lastParticle = value;
                // Если перерыв между запросами, то пропускаем
                if (!this.isBreak) {
                    // Пропускаем несколько обновлений
                    if (this.updateIndex++ > 3) {
                        if (this.endTimePreviousRequest !== 0) {
                            this.decreaseTimeSum -= (Date.now() - this.endTimePreviousRequest) - 150 * 4;
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
                            this.onEndTest();
                            this.abort()
                        }
                    }
                }
            },
            error: err => {
                this.run = false;
                this.request.abort()
                this.updater.error("Потеряно соединение с сокет сервером, при тестировании скорости загрузки.");
            }
        })
    }
}
