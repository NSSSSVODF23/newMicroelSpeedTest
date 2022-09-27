import {TestingRequest} from "../../interfaces/testing-request";
import {Observable, Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {UploadParticle} from "../speed-test-controller";
import {TestingStage} from "../../transport/enums/testing-stage";

const HOSTNAME = location.hostname;
const PORT = "8080";

export class UploadTestingRequest implements TestingRequest {
    private updater = new Subject<{ bytes: number, decreaseTime: number } | number>();
    private webSocket = webSocket<UploadParticle>({
        url: `ws://${HOSTNAME}:${PORT}/upload/${localStorage.getItem(
            "deviceId",
        )}`,
    });

    private SIZE_OF_REQUEST = 50 * 16; // Считаем количество чанков для загрузки
    private data: ArrayBuffer[] = []; // Объявляем переменную для хранения данных
    private SIZE = 65536; // Количество байт в одном чанке
    private isBreak = false; // Если закончился предыдущий запрос, но не начался новый
    private updateIndex = 0; // Текущее количество обновлений в текущем запросе
    private endTimePreviousRequest: number = 0; // Конец предыдущего запроса
    private startTimeCurrentRequest: number = 0; // Начало текущего запроса
    private lastParticle?: UploadParticle;

    constructor() {

        for (let index = 0; index < this.SIZE_OF_REQUEST; index++) {
            this.data.push(new ArrayBuffer(this.SIZE)); // Заполняем массив данными
        }

        this.webSocket.subscribe({
            next: (value) => {
                this.lastParticle = value;
                // Если перерыв между запросами, то пропускаем
                if (!this.isBreak) {
                    // Пропускаем несколько обновлений
                    if (this.updateIndex < 3) {
                        this.updateIndex++; // Добавляем количество обновлений
                    } else {
                        if (this.endTimePreviousRequest !== 0) {
                            // Если время конца предыдущего запроса не обнулено
                            this.startTimeCurrentRequest = Date.now(); // Устанавливаем время начала текущего запроса
                            this.updater.next({
                                bytes: value.b,
                                decreaseTime: this.startTimeCurrentRequest - this.endTimePreviousRequest
                            });
                            this.endTimePreviousRequest = 0; // Обнуляем время конца предыдущего запроса
                            this.startTimeCurrentRequest = 0; // Обнуляем время начала текущего запроса
                        } else {
                            // Если нет, то просто обновляем
                            this.updater.next(value.b);
                        }

                        // Если пакет определен и время его получение превышает таймаут, то прерываем тест
                        if (value.e >= 15000) {
                            this.updater.complete()
                            this.webSocket.complete()
                        }
                    }
                }

                this.updater.next(value.b)
            }
        })


    }

    getObserver(): Observable<{ bytes: number, decreaseTime: number } | number> {
        return this.updater.asObservable();
    }

    sendRequest(): void {
        const request = new XMLHttpRequest(); // Объявляем новый запрос

        // Устанавливаем параметры запроса
        request.open(
            "POST",
            `http://${HOSTNAME}:${PORT}/public/upload?deviceId=${localStorage.getItem(
                "deviceId",
            )}`,
        );

        // Устанавливаем обработчик ошибки
        request.upload.onerror = () => {
            this.updater.error("Ошибка теста на загрузку");
            this.webSocket.complete();
        };

        // Обрабатываем начало нового запроса
        request.upload.onprogress = () => {
            if (this.isBreak) {
                // Если флаг прерывания
                this.isBreak = false; // Отключаем флаг прерывания
            }
        };

        // Обрабатываем конец нового запроса
        request.upload.onloadend = () => {
            if (!this.updater.closed) {
                this.sendRequest(); // Начинаем новый запрос
            }
            this.isBreak = true; // Устанавливаем флаг прерывания
            this.endTimePreviousRequest = Date.now(); // Устанавливаем время конца текущего запроса
            this.updateIndex = 0; // Обнуляем количество обновлений
        };

        // Отправляем запрос
        request.send(
            new Blob(this.data, {type: "application/octet-stream"}),
        );
    }
}