import {BehaviorSubject, delay, last, Observable, retryWhen} from "rxjs";
import {v4} from "uuid";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";

/**
 * Интерфейс для описания объекта тестирования времени запроса, его тело
 * начальное и конечное время запроса
 */
interface ResponseInterval {
    uuid: string; // Идентификатор запроса
    start: number; // Время начала запроса
    end: number; // Время окончания запроса
}

/**
 * Для обновления интерфейса пользователя при проведении тестирования
 */
interface PingTestResultValues {
    /** Время ответа */
    ping: string;
    /** Дрожание */
    jitter: string;
}

const TIMEOUT = 5000; // Таймаут тестирования
const REQUEST_COUNT = 100; // Количество запросов
const COUNT_SKIP_RESPONSE = 8; // Количество запросов, которые не обрабатываются в ответе
const HOSTNAME = location.hostname;
const PORT = location.port;

/**
 * Класс аккумулирует информацию о задержках ответов от сервера
 * при объявлении объекта класса генерирует массив запросов с уникальными идентификаторами
 * после каждый из них можно получить по порядку
 * при получении очередного тела запроса происходит запись метки времени начала этого запроса
 * после методом setResponse добавляется метка времени окончания этого запроса при условии что
 * тело запроса передаваемого в метод совпадает с телом запроса из массива запросов
 */
export class PingTestController {
    public pingValue = 0; // Значение задержки в миллисекундах
    public jitterValue = 0; // Значение дрожания в миллисекундах
    private webSocket: WebSocketSubject<string> = webSocket<string>({
        url: `ws://${HOSTNAME}:${PORT}/ping/${localStorage.getItem(
            "deviceId",
        )}`,
    })
    private observer: BehaviorSubject<PingTestResultValues>; // Объект подписки на изменение значения
    private requests: Array<ResponseInterval> = []; // Массив запросов
    private timeout: any; // Таймер прерывания тестирования
    private nextIndex = 0; // Индекс следующего сгенерированного запроса
    private responseCount = 0; // Количество ответов от сервера

    constructor() {
        this.observer = new BehaviorSubject({
            ping: "__.___",
            jitter: "__.___",
        }); // Создаем диспетчер подписки

        // Заполняем массив запросов
        for (let i = 0; i < REQUEST_COUNT; i++) {
            this.requests.push({uuid: v4(), start: 0, end: 0});
        }

        this.webSocket.pipe(retryWhen((errors) => errors.pipe(delay(2_000)))).subscribe({next: this.sendRequest.bind(this)});
    }

    /**
     * Возвращает Observable для подписки на изменения значения.
     */
    public getObserver(): Observable<PingTestResultValues> {
        return this.observer.asObservable();
    }

    public run() {
        this.sendRequest();
    }

    private sendRequest(response?: string) {
        if (response) this.setResponse(response); // Принимаем ответ от сервера
        const pingRequest = this.getNextRequestBody(); // Получаем запрос для пинга
        if (pingRequest) {
            this.webSocket.next(pingRequest); // Отправляем запрос еще раз если есть следующий запрос
        } else {
            this.webSocket.complete();
            this.observer.complete();
        }
    }

    /**
     * Вычисляет значение задержки в миллисекундах. На основе массива запросов.
     * @returns Число с плавающей точкой задержки в миллисекундах
     */
    private getAvgPing(): number {
        const intervals = this.requests.filter((i) => i.end !== 0); // Берем только те запросы на которые пришли ответы

        // Вычисляем задержку в запросах и суммируем все значения
        const ping = intervals
            .map((i) => i.end - i.start)
            .filter((d, i) => i >= COUNT_SKIP_RESPONSE)
            .reduce((acc, cur) => acc + cur, 0);

        // Возвращаем среднее значение задержки
        return ping / (intervals.length - COUNT_SKIP_RESPONSE);
    }

    /**
     * Вычисляет значение дрожания в миллисекундах. На основе массива запросов.
     * @returns Число с плавающей точкой дрожания в миллисекундах
     */
    private getAvgJitter(): number {
        const intervals = this.requests.filter((i) => i.end !== 0); // Берем только те запросы на которые пришли ответы
        const durations = intervals.map((i) => i.end - i.start); // Вычисляем время запросов

        // Вычисляем дрожание в запросах и суммируем все значения
        const jitter = durations
            .map((d, i) => {
                if (i < COUNT_SKIP_RESPONSE) {
                    return 0;
                } else {
                    return Math.abs(d - durations[i - 1]);
                }
            })
            .reduce((acc, cur) => acc + cur, 0);

        // Возвращаем среднее значение дрожания
        return jitter / (durations.length - COUNT_SKIP_RESPONSE);
    }

    /**
     * Метод для получения очередного тела запроса для его последующей отправки на сервер.
     * При первом вызове, создается таймер для прерывания тестирования.
     * @returns Уникальную строку для идентификации запроса,
     * или null в случае если сгенерированные запросы закончились.
     */
    private getNextRequestBody(): string | null {
        // Если это первый запрос
        if (this.nextIndex === 0)
            // Объявляем таймаут для прерывания тестирования
            this.timeout = setTimeout(() => {
                if (this.requests.every((i) => i.end === 0)) {
                    this.observer.error("Ошибка проведения теста на задержку сигнала.");
                } else {
                    this.pingValue = this.getAvgPing(); // Вычисляем задержку
                    this.jitterValue = this.getAvgJitter(); // Вычисляем дрожание
                    this.observer.next({
                        ping: this.pingValue.toFixed(3).toString(),
                        jitter: this.jitterValue.toFixed(3).toString(),
                    }); // Оповещаем об изменении значения
                    this.observer.complete(); // Завершаем подписку
                }
            }, TIMEOUT);

        // Если запросы закончились
        if (this.nextIndex === REQUEST_COUNT) {
            return null; // Возвращаем null вместо тела запроса
        }

        const interval = this.requests[this.nextIndex++]; // Берем следующий запрос
        interval.start = performance.now(); // Запоминаем время начала запроса
        return interval.uuid; // Возвращаем тело запроса
    }

    /**
     * Метод для получения очередного тела ответа от сервера, и записи времени окончания запроса.
     * @param uuid Уникальный идентификатор запроса. Используется для поиска запроса в массиве.
     */
    private setResponse(uuid: string) {
        const interval = this.requests.find((i) => i.uuid === uuid); // Ищем запрос по uuid

        // Если запрос найден
        if (interval) {
            interval.end = performance.now(); // Запоминаем время окончания запроса
        }

        // Если запросы закончились
        if (REQUEST_COUNT === ++this.responseCount) {
            this.pingValue = this.getAvgPing(); // Вычисляем задержку
            this.jitterValue = this.getAvgJitter(); // Вычисляем дрожание
            this.observer.next({
                ping: this.pingValue.toFixed(3).toString(),
                jitter: this.jitterValue.toFixed(3).toString(),
            }); // Оповещаем об изменении значения
            this.observer.complete(); // Завершаем подписку
            clearTimeout(this.timeout); // Останавливаем таймаут
        }
    }
}
