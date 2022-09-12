import { Injectable } from "@angular/core";
import {
	BehaviorSubject,
	delay,
	map,
	Observable,
	of,
	retry,
	Subject,
	Subscription,
	zip,
} from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { PingTestController } from "src/app/common/class/ping-test-controller";
import { SpeedChartPoint } from "src/app/common/components/speed-chart/speed-chart.component";
import { speedCalc } from "src/app/common/method/math";
import { DeviceInfoService } from "src/app/common/service/device-info.service";
import {
	MeasureActionTypes,
	MeasureActionMessage,
} from "src/app/common/transport/models/measure-action-message";
import { Measure } from "src/app/common/transport/models/measure";
import { MeasureConnectionTypes } from "src/app/common/transport/enums/connection-types";
import { TestingStage } from "src/app/common/transport/enums/testing-stage";
import {
	SpeedTestController,
	UploadParticle,
} from "../../../common/class/speed-test-controller";
import { Router } from "@angular/router";

const BACKEND_HOSTNAME = location.hostname;
const BACKEND_PORT = "8080";

@Injectable({
	providedIn: "root",
})
export class TestingService {
	pingTest = new PingTestController(); // Объект хранит информацию о текущем тесте на пинг
	downloadTest = new SpeedTestController(); // Объект для хранения информации о текущем тесте на скачивание
	uploadTest = new SpeedTestController(); // Объект для хранения информации о текущем тесте на загрузку

	subscribes: Subscription[] = [];

	pingTestSubscription?: Subscription;
	downloadTestSubscription?: Subscription;
	uploadTestSubscription?: Subscription;

	testStage = TestingStage.UNKNOWN;
	connectionType = MeasureConnectionTypes.WIFI;

	// Сокет соединения с сервером для общего управления тестом
	measureSocket$ = webSocket<MeasureActionMessage>({
		url: `ws://${BACKEND_HOSTNAME}:${BACKEND_PORT}/measure/${localStorage.getItem(
			"deviceId",
		)}`,
	});

	// Сокет соединения с сервером для пинга
	pingSocket$?: WebSocketSubject<String>;

	// Сокет соединения с сервером для тестирования загрузки
	uploadTestSocket$?: WebSocketSubject<UploadParticle>;

	currentDownloadRequest?: XMLHttpRequest;
	currentUploadRequest?: XMLHttpRequest;

	isSessionPrepared: boolean = false;

	constructor(readonly deviceInfo: DeviceInfoService, readonly router: Router) {
		// Открываем общее соединение с сервером для управления тестом
		this.measureSocket$.pipe(retry(999)).subscribe((observe) => {
			if (observe.type === MeasureActionTypes.RESULT) {
				router.navigate(["/result"], {
					queryParams: { id: observe.resultId },
				});
			}
		});
	}

	/**
	 * Отправляет команду на сервер о подготовке к тестированию и данные о устройстве
	 */
	public sendPrepare() {
		this.testStage = TestingStage.PREPARE; // Устанавливаем стадию тестирования в подготовку
		this.measureSocket$.next({
			type: MeasureActionTypes.PREPARE,
			deviceInfo: this.deviceInfo.getDeviceInfo(),
		});
		this.isSessionPrepared = true;
	}

	/**
	 * Отправляет команду на сервер о начале тестирования
	 */
	public sendStart() {
		this.initSubscribers();
		this.measureSocket$.next({
			type: MeasureActionTypes.START,
			deviceInfo: this.deviceInfo.getDeviceInfo(),
			connectionType: this.connectionType,
		});
		this.startPingTest(); // Запускаем тест на задержку ответа от сервера
	}

	/**
	 * Запускает тест на задержку ответа от сервера
	 */
	private startPingTest() {
		this.pingSocket$ = webSocket<String>({
			url: `ws://${BACKEND_HOSTNAME}:${BACKEND_PORT}/ping/${localStorage.getItem(
				"deviceId",
			)}`,
		});
		this.testStage = TestingStage.PING; // Устанавливаем стадию тестирования
		let pingRequest = this.pingTest.getNextRequestBody(); // Получаем запрос для пинга
		console.log(pingRequest);
		if (pingRequest) this.pingSocket$.next(pingRequest); // Отправляем запрос

		// Подписываемся на ответ от сервера
		this.subscribes.push(
			this.pingSocket$.subscribe((observe) => {
				this.pingTest.setResponse(observe); // Принимаем ответ от сервера
				pingRequest = this.pingTest.getNextRequestBody(); // Получаем запрос для пинга
				if (pingRequest) this.pingSocket$?.next(pingRequest); // Отправляем запрос еще раз если есть следующий запрос
			}),
		);
	}

	/**
	 * Запускает тест на скачивание данных
	 */
	private startDownloadTest() {
		this.testStage = TestingStage.DOWNLOAD; // Устанавливаем стадию тестирования
		let loadBytes = 0; // Количество загруженных байт

		const TIME_BETWEEN_UPDATE_SPEED = 150; // Время между обновлением скорости

		// Метод для обновления данных о скорости
		const updateSpeed = () => {
			this.downloadTest.appendBytes(loadBytes); // Добавляем данные о скорости
		};

		const timer = setInterval(updateSpeed, TIME_BETWEEN_UPDATE_SPEED); // Запускаем таймер тестирования

		this.currentDownloadRequest = new XMLHttpRequest(); // Создаем запрос
		this.currentDownloadRequest.timeout = 15000 + TIME_BETWEEN_UPDATE_SPEED * 2; // Устанавливаем время для тестирования
		this.currentDownloadRequest.open(
			"POST",
			`http://${BACKEND_HOSTNAME}:${BACKEND_PORT}/public/download?deviceId=${localStorage.getItem(
				"deviceId",
			)}`,
			true,
		); // Устанавливаем параметры запроса

		// Обработчик получения количества загруженных байт
		this.currentDownloadRequest.onprogress = (event) => {
			loadBytes = event.loaded; // Устанавливаем количество загруженных байт
		};

		// Обработчик завершения запроса
		this.currentDownloadRequest.ontimeout = () => {
			clearInterval(timer); // Останавливаем таймер
			this.downloadTest.calculateFinal(); // Рассчитываем конечные данные
		};

		this.currentDownloadRequest.onabort = () => {
			clearInterval(timer); // Останавливаем таймер
		};

		this.currentDownloadRequest.onerror = this.downloadTest.observer$.error; // Обработчик ошибки
		this.currentDownloadRequest.send(); // Отправляем запрос
	}

	/**
	 * Запускает тест на загрузку данных
	 */
	private startUploadTest(requestSizeMbyte: number) {
		this.uploadTestSocket$ = webSocket<UploadParticle>({
			url: `ws://${BACKEND_HOSTNAME}:${BACKEND_PORT}/upload/${localStorage.getItem(
				"deviceId",
			)}`,
		});
		this.testStage = TestingStage.UPLOAD; // Устанавливаем стадию тестирования
		let SIZE_OF_REQUEST = requestSizeMbyte * 16; // Считаем количество чанков для загрузки
		const data: ArrayBuffer[] = []; // Объявляем переменную для хранения данных
		const SIZE = 65536; // Количество байт в одном чанке
		for (let index = 0; index < SIZE_OF_REQUEST; index++) {
			data.push(new ArrayBuffer(SIZE)); // Заполняем массив данными
		}

		this.currentUploadRequest = new XMLHttpRequest(); // Объект запроса
		let isRunning = true; // Запущен ли тест
		let updateIndex = 0; // Текущее количество обновлений в текущем запросе
		let isBreak = false; // Если закончился предыдущий запрос но не начался новый
		let endTimePreviousRequest: number = 0; // Конец предыдущего запроса
		let startTimeCurrentRequest: number = 0; // Начало текущего запроса

		// Если тест длится более 30 секунд, то прерываем его
		let emergencyTimer = setTimeout(() => {
			this.uploadTest.observer$.error("Тест на загрузку прерван по таймауту"); // Пушим ошибку в диспетчер
			this.uploadTestSocket$?.complete(); // Закрываем сокет
			isRunning = false; // Останавливаем тест
		}, 30000);

		// Метод объявляет новый запрос и продолжает тестирование
		const dynContinue = () => {
			if (!isRunning) return; // Если не запущен тест, то прерываем его
			this.currentUploadRequest = new XMLHttpRequest(); // Объявляем новый запрос

			// Устанавливаем параметры запроса
			this.currentUploadRequest.open(
				"POST",
				`http://${BACKEND_HOSTNAME}:${BACKEND_PORT}/public/upload?deviceId=${localStorage.getItem(
					"deviceId",
				)}`,
				true,
			);

			// Устанавливаем обработчик ошибки
			this.currentUploadRequest.upload.onerror = () => {
				this.uploadTest.observer$.error("Ошибка теста на загрузку");
				this.uploadTestSocket$?.complete();
				isRunning = false;
			};

			// Обрабатываем начало нового запроса
			this.currentUploadRequest.upload.onprogress = () => {
				if (isBreak) {
					// Если флаг прерывания
					isBreak = false; // Отключаем флаг прерывания
				}
			};

			// Обрабатываем конец нового запроса
			this.currentUploadRequest.upload.onloadend = () => {
				dynContinue(); // Начинаем новый запрос
				isBreak = true; // Устанавливаем флаг прерывания
				endTimePreviousRequest = Date.now(); // Устанавливаем время конца текущего запроса
				updateIndex = 0; // Обнуляем количество обновлений
			};

			// Отправляем запрос
			this.currentUploadRequest.send(
				new Blob(data, { type: "application/octet-stream" }),
			);
		};

		const endTestTimeout = 15000; // Таймаут продолжительности теста в миллисекундах

		// Получаем данные с сервера через сокет
		this.subscribes.push(
			this.uploadTestSocket$.subscribe((observe) => {
				// Если перерыв между запросами, то пропускаем
				if (!isBreak) {
					// Пропускаем несколько обновлений
					if (updateIndex < 3) {
						updateIndex++; // Добавляем количество обновлений
					} else {
						if (endTimePreviousRequest !== 0) {
							// Если время конца предыдущего запроса не обнулено
							startTimeCurrentRequest = Date.now(); // Устанавливаем время начала текущего запроса
							this.uploadTest.appendUploadParticle(
								observe,
								startTimeCurrentRequest - endTimePreviousRequest,
							);
							endTimePreviousRequest = 0; // Обнуляем время конца предыдущего запроса
							startTimeCurrentRequest = 0; // Обнуляем время начала текущего запроса
						} else {
							// Если нет, то просто обновляем
							this.uploadTest.appendUploadParticle(observe);
						}

						// Если пакет определен и время его получение превышает таймаут, то прерываем тест
						if (
							this.uploadTest.getLastParticle() &&
							this.uploadTest.getLastParticle().e >= endTestTimeout
						) {
							isRunning = false; // Отключаем флаг запуска
							clearTimeout(emergencyTimer); // Останавливаем таймер
							this.uploadTestSocket$?.complete(); // Закрываем сокет
							this.currentUploadRequest?.abort(); // Обрываем запрос
							this.testStage = TestingStage.RESULT;
							this.uploadTest.calculateFinal(); // Вычисляем финальные показатели
						}
					}
				}
			}),
		);

		dynContinue(); // Начинаем тестирование
	}

	/**
	 * Обрывает соединения
	 */
	private abortRequests(): void {
		// Проверяем открыты ли запросы и закрываем их
		if (this.currentDownloadRequest?.readyState !== XMLHttpRequest.DONE) {
			this.currentDownloadRequest?.abort();
		}
		if (this.currentUploadRequest?.readyState !== XMLHttpRequest.DONE) {
			this.currentUploadRequest?.abort();
		}
	}

	public initSubscribers(): void {
		// Обрабатываем окончание тестирования пинга
		this.subscribes.push(
			this.pingTest.getFinishTest().subscribe(() => {
				this.pingSocket$?.complete(); // Закрываем соединение с сервером
				this.startDownloadTest(); // Запускаем тест на скачивание
			}),
		);

		// Обрабатываем окончание тестирования скачивания
		this.subscribes.push(
			this.downloadTest.getFinishTest().subscribe(() => {
				this.startUploadTest(50); // Запускаем тест на загрузку
				// Отправляем запрос на завершение тестирования
				// this.measureSocket$.next({
				// 	type: MeasureActionTypes.END,
				// 	deviceInfo: this.deviceInfo.getDeviceInfo(),
				// 	result: new Measure(
				// 		this.pingTest,
				// 		this.downloadTest,
				// 		this.uploadTest,
				// 	),
				// });
			}),
		);

		// Обрабатываем окончание тестирования загрузки
		this.subscribes.push(
			this.uploadTest.getFinishTest().subscribe(() => {
				// Отправляем запрос на завершение тестирования
				this.measureSocket$.next({
					type: MeasureActionTypes.END,
					deviceInfo: this.deviceInfo.getDeviceInfo(),
					result: new Measure(
						this.pingTest,
						this.downloadTest,
						this.uploadTest,
					),
				});
			}),
		);
	}

	/**
	 * Останавливаем тестирование, обнуляет поля объекта
	 */
	public stop(): void {
		this.abortRequests(); // Останавливаем запросы
		this.measureSocket$.next({
			type: MeasureActionTypes.ABORT,
			deviceInfo: this.deviceInfo.getDeviceInfo(),
		}); // Отправляем запрос на прерывание тестирования
		this.subscribes.forEach((subscribe) => subscribe.unsubscribe()); // Отписываемся от всех подписок
		this.subscribes = []; // Обнуляем массив подписок
		this.pingSocket$?.complete(); // Останавливаем сокет пинга
		this.uploadTestSocket$?.complete(); // Останавливаем сокет теста загрузки
		this.pingTest.observer$.complete(); // Останавливаем подписку на пинг
		this.downloadTest.observer$.complete(); // Останавливаем подписку на скачивание
		this.uploadTest.observer$.complete(); // Останавливаем подписку на загрузку
		this.testStage = TestingStage.UNKNOWN; // Устанавливаем флаг остановки
		this.pingTest = new PingTestController(); // Обнуляем
		this.downloadTest = new SpeedTestController(); // Обнуляем
		this.uploadTest = new SpeedTestController(); // Обнуляем
	}
}
