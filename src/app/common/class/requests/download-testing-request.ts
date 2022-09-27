import {TestingRequest} from "../../interfaces/testing-request";
import {Observable, Subject} from "rxjs";

const HOSTNAME = location.hostname;
const PORT = "8080";

export class DownloadTestingRequest implements TestingRequest {
    private updater = new Subject<number>();
    private byteCounter = 0;
    private prevLoadedBytes = 0;

    getObserver(): Observable<number> {
        return this.updater.asObservable();
    }

    sendRequest(): void {
        const request = new XMLHttpRequest(); // Создаем запрос

        request.open(
            "POST",
            `http://${HOSTNAME}:${PORT}/public/download?deviceId=${localStorage.getItem(
                "deviceId",
            )}`,
        ); // Устанавливаем параметры запроса

        // Обработчик получения количества загруженных байт
        request.onprogress = (event) => {
            this.byteCounter += event.loaded - this.prevLoadedBytes; // Устанавливаем количество загруженных байт
            this.updater.next(this.byteCounter);
        };

        request.onloadend = () => {
            if (!this.updater.closed) {
                this.sendRequest();
            }
        }

        request.onerror = () => {
            this.updater.error("Ошибка теста на скачивание");
        } // Обработчик ошибки

        request.send(); // Отправляем запрос
    }
}