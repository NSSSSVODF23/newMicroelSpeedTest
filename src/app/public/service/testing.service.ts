import {Injectable} from "@angular/core";
import {delay, retry, retryWhen, Subscription,} from "rxjs";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {PingTestController} from "src/app/common/class/ping-test-controller";
import {DeviceInfoService} from "src/app/common/service/device-info.service";
import {MeasureActionMessage, MeasureActionTypes,} from "src/app/common/transport/models/measure-action-message";
import {Measure} from "src/app/common/transport/models/measure";
import {MeasureConnectionTypes} from "src/app/common/transport/enums/connection-types";
import {TestingStage} from "src/app/common/transport/enums/testing-stage";
import {SpeedCounter} from "../../common/class/speed-counter";
import {Router} from "@angular/router";
import {DownloadTestingRequest} from "../../common/class/requests/download-testing-request";
import {UploadTestingRequest} from "../../common/class/requests/upload-testing-request";

const HOSTNAME = location.hostname;
const PORT = location.port;

@Injectable({
    providedIn: "root",
})
export class TestingService {
    pingTest: PingTestController // Объект хранит информацию о текущем тесте на пинг
    downloadTest: SpeedCounter // Объект для хранения информации о текущем тесте на скачивание
    uploadTest: SpeedCounter // Объект для хранения информации о текущем тесте на загрузку
    isSocketOpen = false;

    testStage = TestingStage.UNKNOWN;
    connectionType = MeasureConnectionTypes.WIFI;

    // Сокет соединения с сервером для общего управления тестом
    measureSocket = webSocket<MeasureActionMessage>({
        url: `ws://${HOSTNAME}:${PORT}/measure/${localStorage.getItem(
            "deviceId",
        )}`,
        openObserver: {next: () => this.isSocketOpen = true},
        closeObserver: {next: () => this.isSocketOpen = false}
    });

    isProMode = false;

    constructor(readonly deviceInfo: DeviceInfoService, readonly router: Router) {
        this.pingTest = new PingTestController();
        this.downloadTest = new SpeedCounter(new DownloadTestingRequest())
        this.uploadTest = new SpeedCounter(new UploadTestingRequest())
        // Открываем общее соединение с сервером для управления тестом
        this.measureSocket.pipe(retryWhen((errors) => errors.pipe(delay(2_000)))).subscribe({
                next: (observe) => {
                    if (observe.type === MeasureActionTypes.GET_DEVICE_INFO) {
                        this.measureSocket.next({
                            type: MeasureActionTypes.DEVICE_INFO,
                            deviceInfo: deviceInfo.getDeviceInfo()
                        })
                    }
                    if (observe.type === MeasureActionTypes.TESTING_MODE) {
                        this.isProMode = !!observe.isPro;
                    }
                    if (observe.type === MeasureActionTypes.RESULT) {
                        router.navigate(["/result"], {
                            queryParams: {id: observe.resultId},
                        }).then();
                    }
                }
            }
        )
    }

    public clear() {
        this.downloadTest.abort()
        this.uploadTest.abort()
        this.pingTest = new PingTestController(); // Объект хранит информацию о текущем тесте на пинг
        this.downloadTest = new SpeedCounter(new DownloadTestingRequest()); // Объект для хранения информации о текущем тесте на скачивание
        this.uploadTest = new SpeedCounter(new UploadTestingRequest()); // Объект для хранения информации о текущем тесте на загрузку
        this.testStage = TestingStage.PREPARE;
    }

    /**
     * Отправляет команду на сервер о начале тестирования
     */
    public sendStart() {
        this.initSubscribers();
        this.measureSocket.next({
            type: MeasureActionTypes.START,
            deviceInfo: this.deviceInfo.getDeviceInfo(),
            connectionType: this.connectionType,
        });
        this.startPingTest(); // Запускаем тест на задержку ответа от сервера
    }

    public initSubscribers(): void {
        this.pingTest.getObserver().subscribe({
            complete: () => this.startDownloadTest(),
            error: this.errorHandler.bind(this)
        })
        this.downloadTest.getObserver().subscribe({
            complete: () => this.startUploadTest(),
            error: this.errorHandler.bind(this)
        })
        this.uploadTest.getObserver().subscribe({error: this.errorHandler.bind(this)})
        this.uploadTest.onTestEnd(() => {
            // Отправляем запрос на завершение тестирования
            this.measureSocket.next({
                type: MeasureActionTypes.END,
                deviceInfo: this.deviceInfo.getDeviceInfo(),
                result: new Measure(
                    this.pingTest,
                    this.downloadTest,
                    this.uploadTest,
                ),
            });
        })
    }

    private errorHandler(err: any) {
        this.router.navigate(['error'], {queryParams: {err}}).then()
    }

    /**
     * Запускает тест на задержку ответа от сервера
     */
    private startPingTest() {
        this.testStage = TestingStage.PING; // Устанавливаем стадию тестирования
        this.pingTest.run();
    }

    /**
     * Запускает тест на скачивание данных
     */
    private startDownloadTest() {
        this.testStage = TestingStage.DOWNLOAD; // Устанавливаем стадию тестирования
        this.downloadTest.run();
    }

    /**
     * Запускает тест на загрузку данных
     */
    private startUploadTest() {
        this.testStage = TestingStage.UPLOAD;
        this.uploadTest.run();
    }
}
