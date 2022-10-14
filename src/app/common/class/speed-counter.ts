import {BehaviorSubject, last, Observable} from "rxjs";
import {SpeedChartPoint} from "../components/speed-chart/speed-chart.component";
import {getAvgMaxFromArray, roundToPrecision, speedCalc} from "../method/math";
import {TestingRequest} from "../interfaces/testing-request";
import {UploadTestingRequest} from "./requests/upload-testing-request";

/**
 * Интерфейс для описания объекта получаемого от сервера,
 * при измерении скорости загрузки данных на сервер.
 */
export interface UploadParticle {
    /** Количество байт загруженных на сервер. */
    b: number;
    /** Время в миллисекундах последнего измерения, с начала загрузки данных. */
    e: number;
    /** Индекс измерения в последовательности измерений. */
    i: number;
}

/**
 * Данные для отправки в интерфейс пользователя при измерении.
 */
export interface TestingResultValues {
    /** Скорость загрузки данных на сервер. */
    speed: string;
    /** Скорость для юзера */
    slowSpeed: string;
    /** Стабильность загрузки данных на сервер. */
    stability: string;
    /** Процент потери данных на сервер. */
    loss: string;
    /** Данные графиков загрузки данных на сервер. */
    chartData: SpeedChartPoint[];
    /** График для юзера */
    slowChartData: SpeedChartPoint[];
}

/**
 * Класс аккумулирующий информацию об измерении скорости обмена данными с сервером.
 */
export class SpeedCounter {
    /** Текущая скорость */
    public currentValue: number = 0.0;
    /** Текущая медленная скорость */
    public slowCurrentValue: number = 0.0;
    /** Массив значений скорости с меткой времени получения замера для построения графика */
    public chartData: SpeedChartPoint[] = [];
    /** Массив значений медленной скорости с меткой времени получения замера для построения графика */
    public slowChartData: SpeedChartPoint[] = [];
    /** Значение стабильности скорости */
    public stability: number = 100;
    /** Процент потерь */
    public percentLoss: number = 0;
    /** Диспетчер обновления данных в объекте. При подписке возвращает ссылку на сам объект. */
    private testingRequest: TestingRequest;
    /** Массив с размерами окна сглаживания для построения нескольких графиков. */
    private avgWindowSizes: number[] = [15, 40, 50];
    /** Массив массивов со сглаженными значениями для каждого окна сглаживания. */
    private avgValuesArrays: number[][] = [];
    private slowValuesArray: number[] = [];
    /** Массив сырых значений скорости */
    private rawValues: number[] = [];
    /** Массив разности значений между быстрой и медленной средней */
    private differenceArray: number[] = [];
    /** Амплитуда изменения скорости */
    private amplitude: number = 0;
    /** Количество всплесков в графике */
    private amplitudeCount: number = 0;
    /** Разность максимального и минимального значения скорости */
    private speedInterval: number = 0;
    /** Максимальная скорость */
    private maxSpeed: number = 0;
    /** Количество замеров скорости с нулевым значением */
    private countZeroValues: number = 0;
    /** Соотношение нулевых замеров от 0 до 1 относительно всех замеров. */
    private zeroRatio: number = 0;
    private loadedBytesTuple: number[] = [];
    /** Дата и время последнего замера */
    private loadStamp: number = performance.now();
    /** Количество загруженных байт */
    private loadBytes: number = 0;
    /** Массив с данными от сервера при тестировании исходящей скорости соединения */
    private uploadPackets: UploadParticle[] = [];
    /** Время начала старта тестирования */
    private startTestTime: number = 0;
    /** Индекс основного окна сглаживания */
    private smoothLevel: number = 0;
    /** Время в миллисекундах затраченное на подготовку данных для следующего запроса */
    private breakTestTime: number = 0;

    constructor(request: TestingRequest) {
        this.testingRequest = request;
        this.testingRequest.getObserver().subscribe({
            next: (value) => {
                if (typeof value === "number") {
                    this.appendBytes(value);
                    this.addByteToTuple(value)
                } else {
                    this.appendUploadParticle(value);
                    this.addByteToTuple(value.b);
                }
            },
            complete: () => {
                if (this.isEnded()) this.calculateFinal()
            }
        })
    }

    public isEnded() {
        return this.testingRequest.getIsEnded();
    }

    public getObserver() {
        return this.testingRequest.getObserver();
    }

    public onTestEnd(handler: () => void) {
        this.testingRequest.setEndTestHandler(handler);
    }

    public run() {
        this.testingRequest.sendRequest();
    }

    public abort() {
        this.testingRequest.abort();
    }

    /**
     * Рассчитывает окончательные значения и останавливает диспетчер обновления интерфейса.
     */
    public calculateFinal() {
        const sortedFast = this.avgValuesArrays[this.smoothLevel].sort((a, b) => a - b).slice(-30);
        const sortedSlow = this.slowValuesArray.sort((a, b) => a - b).slice(-30);
        this.currentValue = sortedFast.reduce((prev, curr) => prev + curr, 0) / sortedFast.length;
        this.slowCurrentValue = sortedSlow.reduce((prev, curr) => prev + curr, 0) / sortedSlow.length;
    }

    /**
     * Добавляет данные по текущей скорости
     * @param {number} newBytes Новое количество загруженных байт
     */
    public appendBytes(newBytes: number) {
        // Если это первый замер не обновляем поля объекта
        if (this.loadBytes === 0) {
            this.loadStamp = performance.now(); // Записываем время начала замера
            this.loadBytes = newBytes; // Записываем начальное значение загруженных байт
        } else {
            const speed = speedCalc(newBytes, this.loadBytes, this.loadStamp); // Рассчитываем скорость
            this.loadStamp = performance.now(); // Записываем время последнего замера
            this.loadBytes = newBytes; // Записываем количество загруженных байт
            this.updateValues(speed); // Обновляем значения объекта
        }
    }

    /**
     * Добавляет данные по текущей скорости из Upload Particle
     * @param {UploadParticle} uploadPacket Объект с данными полученный от сервера
     */
    public appendUploadParticle(
        uploadPacket: UploadParticle
    ) {
        this.uploadPackets.push(uploadPacket); // Добавляем данные в массив
        const size = this.uploadPackets.length; // Получаем количество пакетов в массиве

        // Если пакетов больше одного
        if (size > 1) {
            // Считаем скорость загрузки из последних двух пакетов
            const speed = speedCalc(
                uploadPacket.b,
                this.uploadPackets[size - 2].b,
                this.uploadPackets[size - 2].e,
                uploadPacket.e,
            );
            this.updateValues(speed, uploadPacket.e); // Обновляем значения объекта
        }
    }

    private addByteToTuple(loadedBytesCount: number) {
        if (this.loadedBytesTuple.length < 5) {
            this.loadedBytesTuple.push(loadedBytesCount);
        } else {
            this.loadedBytesTuple.splice(0, 1);
            this.loadedBytesTuple.push(loadedBytesCount);
        }
    }

    private isHasLoss() {
        const last = this.loadedBytesTuple.length - 1;
        return last > 0 && this.loadedBytesTuple[0] === this.loadedBytesTuple[last];
    }

    /**
     * Вычисляет значения скорости по объявленным окнам сглаживания.
     * Записывает их в соответствующие массивы в текущем объекте.
     */
    private calculateAvgValues() {
        // Если массив пустой, инициализируем пустые массивы для окон сглаживания
        if (this.avgValuesArrays.length === 0) {
            for (let i = 0; i < this.avgWindowSizes.length; i++) {
                this.avgValuesArrays.push([]); // Инициализация массива для окна сглаживания
            }
        }

        // Перебираем все окна сглаживания
        for (let i = 0; i < this.avgWindowSizes.length; i++) {
            const avgWindowSize = this.avgWindowSizes[i]; // Размер окна сглаживания
            const avgValuesArray = this.avgValuesArrays[i]; // Массив для окна сглаживания

            // Если чистое значение скорости только одно
            if (this.rawValues.length === 1) {
                avgValuesArray.push(this.rawValues[0]);
            } // Если значении скорости больше одного
            else if (this.rawValues.length > 1) {
                const rawValuesSlice = this.rawValues.slice(-avgWindowSize); // Получаем последние значения на основе окна сглаживания
                let avgValue =
                    rawValuesSlice.reduce((a, b) => a + b, 0) / rawValuesSlice.length; // Вычисляем среднее значение
                avgValue = avgValue + avgValue * 0.04; // Добавляем к значению 4% для округления
                avgValuesArray.push(roundToPrecision(avgValue, 3)); // Округляем значение до 3 знаков после запятой и записываем в массив
            }
        }
        const lastSorted = this.avgValuesArrays[this.smoothLevel].slice(-30).sort((a, b) => b - a).slice(0, 3);
        this.slowValuesArray.push(lastSorted.reduce((prev, curr) => prev + curr, 0) / lastSorted.length);
    }

    private calculateZeroRatio() {
        if (this.isHasLoss()) {
            this.countZeroValues++; // Увеличиваем количество нулевых значений

            // Рассчитываем соотношение нулевых значений к общему количеству значений
            this.zeroRatio = roundToPrecision(
                this.countZeroValues / this.rawValues.length,
                6,
            );
            this.percentLoss = roundToPrecision(this.zeroRatio * 100, 2); // Переводим в проценты
        }
    }

    /**
     * Рассчитывает разницу между медленным и быстрым значениями замеров
     * из массива значений скорости.
     * **Выбирается значение по основному индексу окна сглаживания.**
     */
    private calculateDifference() {
        const lastIndex = this.avgValuesArrays[0].length - 1; // Получаем последний индекс массива
        let fastValue = this.avgValuesArrays[this.smoothLevel][lastIndex]; // Получаем быстрое значение
        let slowValue = this.avgValuesArrays[this.smoothLevel + 1][lastIndex]; // Получаем медленное значение
        const difference = fastValue - slowValue; // Рассчитываем разницу
        this.differenceArray.push(difference); // Записываем разницу в массив
    }

    /**
     * Ищет пиковые значения в массиве разности скорости, и рассчитывает среднею амплитуду.
     */
    private calculateAmplitude() {
        // Получаем пиковые значения в differenceArray
        const peaks = []; // Массив пиковых значений
        const amplitudeArray = []; // Массив амплитуд
        let side = "none"; // Текущая сторона пика
        for (let i = 0; i < this.differenceArray.length; i++) {
            const value = this.differenceArray[i]; // Получаем текущее значение
            const lastPeakIndex: number = peaks.length - 1; // Получаем последний индекс массива пиковых значений

            if (value !== 0) {
                // Если сторона не установлена
                if (side === "none") {
                    // Если значение больше нуля
                    if (value > 0) {
                        side = "up"; // Сторона пика вверх
                    } else if (value < 0) {
                        side = "down"; // Сторона пика вниз
                    }
                    peaks.push(value); // Записываем значение в массив
                }
                // Если верхняя сторона пика
                else if (side === "up") {
                    // Если значение меньше нуля
                    if (value < 0) {
                        side = "down"; // Сторона пика вниз
                        peaks.push(value); // Записываем значение в массив
                    }
                    // Если значение больше последнего значения пика
                    else if (value > peaks[lastPeakIndex]) {
                        // Обновляем последнее значение пика
                        peaks[lastPeakIndex] = value;
                    }
                }
                // Если нижняя сторона пика
                else if (side === "down") {
                    // Если значение больше нуля
                    if (value > 0) {
                        side = "up"; // Сторона пика вверх
                        peaks.push(value); // Записываем значение в массив
                    }
                    // Если значение меньше последнего значения пика
                    else if (value < peaks[lastPeakIndex]) {
                        // Обновляем последнее значение пика
                        peaks[lastPeakIndex] = value;
                    }
                }
            }
        }

        // Фильтруем массив амплитуд от низких значений
        const filteredAmplitudeArray = peaks
            .map((value) => Math.abs(value))
            .filter((value) => value > 5);
        // Размер массива амплитуд
        this.amplitudeCount = filteredAmplitudeArray.length;

        // Рассчитываем среднее значение амплитуды
        this.amplitude =
            filteredAmplitudeArray.reduce((a, b) => a + b, 0) / this.amplitudeCount;

        // Расчет интервала скорости на графике
        // сортируем массив скоростей по убыванию
        const sortedSpeedArray = this.avgValuesArrays[this.smoothLevel].sort(
            (a, b) => b - a,
        );
        // Фильтруем 5% крайних значений
        const filteredSpeedArray = sortedSpeedArray.filter((value, index) => {
            const startIndex = Math.round(sortedSpeedArray.length * 0.1);
            const endIndex = Math.round(sortedSpeedArray.length * 0.9);
            return index >= startIndex && index <= endIndex;
        });
        // Вычисляем разницу между первым и последним значением
        this.speedInterval =
            filteredSpeedArray[0] - filteredSpeedArray[filteredSpeedArray.length - 1];
        this.maxSpeed = filteredSpeedArray[0]; // Максимальная скорость
    }

    /**
     * Рассчитывает значение стабильности скорости,
     * на основе массива пропорций разницы между медленным и быстрым значениями.
     * И обновляет поля объекта.
     */
    private calculateStability() {
        const lastSlowSpeedIndex =
            this.avgValuesArrays[this.smoothLevel + 1].length - 1; // Получаем последний индекс массива медленных значений

        let slowToFastRatio = 0;

        // Если массив значений скорости не пустой
        if (this.avgValuesArrays[this.smoothLevel + 1].length > 0) {
            // Берем отношение средней амплитуды к медленному значению скорости
            const slowToFastRatio =
                this.amplitude /
                this.avgValuesArrays[this.smoothLevel + 1][lastSlowSpeedIndex];
        }

        // Отношение количества всплесков к 15
        const peaksTo15Ratio = this.amplitudeCount / 50;
        const speedIntervalRation = this.speedInterval / this.maxSpeed;
        let stabilityIndex = (1 - ((slowToFastRatio + peaksTo15Ratio) / 2 + speedIntervalRation / 4 + this.zeroRatio))
        if (stabilityIndex < 0) stabilityIndex = 0;
        // Складываем среднее значение пропорций с пропорцией потерь, отнимаем от единицы умножаем на 100
        this.stability = stabilityIndex * 100;
    }

    /**
     * Добавляет значение в массив графика скорости
     * @param time Время замера
     */
    private updateChartsData(time?: number) {
        this.chartData.push(
            new SpeedChartPoint(
                time ? time : Date.now() - this.startTestTime,
                this.currentValue,
            ),
        );
        this.slowChartData.push(
            new SpeedChartPoint(
                time ? time : Date.now() - this.startTestTime,
                this.slowCurrentValue
            ),
        );
        this.chartData = [...this.chartData];
        this.slowChartData = [...this.slowChartData];
    }

    /**
     * Добавляет значение очередного замера скорости,
     * и обновляет поля объекта.
     * @param {number} speed Текущая скорость
     * @param {number} time Время замера
     */
    private updateValues(speed: number, time?: number) {
        // Если еще не начался замер
        if (this.rawValues.length === 0) {
            this.startTestTime = Date.now(); // Записываем время начала замера
        }

        this.rawValues.push(speed); // Записываем значение в массив

        this.calculateZeroRatio(); // Рассчитываем пропорцию потерей

        this.calculateAvgValues(); // Рассчитываем сглаженные значения

        // Обновляем текущее значение
        this.currentValue =
            this.avgValuesArrays[this.smoothLevel][this.avgValuesArrays[this.smoothLevel].length - 1];
        this.slowCurrentValue = this.slowValuesArray[this.slowValuesArray.length - 1];


        this.calculateDifference(); // Рассчитываем разницу между медленным и быстрым значениями

        this.updateChartsData(time); // Обновляем график

        this.calculateAmplitude(); // Рассчитываем амплитуду

        this.calculateStability(); // Рассчитываем стабильность скорости
    }
}
