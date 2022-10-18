import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {TieredMenu} from "primeng/tieredmenu";
import {DashboardService} from "../../service/dashboard.service";
import {StatisticService} from "../../service/statistic.service";
import 'chartjs-adapter-moment';
import zoomPlugin from 'chartjs-plugin-zoom';
import {Calendar, ExtendDate, TimeRange} from "../../../common/method/time";
import {
    configureHorizontalLabelStatisticChart,
    configureLinearStatisticChart,
    configureOnlineChart,
    configureTimeStatisticChart,
    getLineDataset
} from "../../../common/method/chart";
import {MeasureConnectionTypes} from "../../../common/transport/enums/connection-types";
import {ActiveSession, GroupCTypeStringIntegerPoint} from "../../../common/transport/models/statistics";
import {Subscription} from "rxjs";
import {updateListResolver} from "../../../common/method/update_resolver";
import {animate, style, transition, trigger} from "@angular/animations";
import {Title} from "@angular/platform-browser";
import {AuthService} from "../../service/auth.service";

const fade = trigger("fade", [
    transition(":enter", [
        style({
            opacity: 0,
            transform: "translate(-5rem,0)"
        }),
        animate(
            "200ms ease-out",
            style({
                opacity: 1,
                transform: "translate(0,0)"
            }),
        ),
    ]),
    transition(":leave", [
        style({
            opacity: 1,
            transform: "translate(0,0)"
        }),
        animate(
            "200ms ease-in-out",
            style({
                opacity: 0,
                transform: "translate(5rem,0)"
            }),
        ),
    ]),
]);

@Component({
    templateUrl: "./dashboard-page.component.html",
    styleUrls: ["./dashboard-page.component.scss"],
    animations: [fade]
})
export class DashboardPageComponent implements OnInit, OnDestroy {
    @ViewChild("statisticMenu") statisticMenu?: ElementRef<TieredMenu>;
    networkChartData = {};
    cpuChartData = {};
    memoryChartData = {};

    chartsPlugins = [zoomPlugin];

    networkChartOptions = configureOnlineChart("Мбит/с");
    cpuChartOptions = configureOnlineChart("%");
    memoryChartOptions = configureOnlineChart("Мбайт");

    statisticCalendarDialogVisible = false;
    statisticCalendarMode: "single" | "range" = "single";
    statisticCalendarValue?: Date | Date[];
    statisticName = "";
    statisticMenuItems = [
        {
            label: "Замеры",
            items: [
                {
                    label: "Количество", items: [
                        {
                            label: "Неделя",
                            command: this.loadMeasurementsCountsInDate.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadMeasurementsCountsInDate.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadMeasurementsCountsInDate, true)
                        },
                    ]
                },
                {
                    label: "Адреса", items: [
                        {
                            label: "Неделя",
                            command: this.loadMeasurementsCountsInAddresses.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadMeasurementsCountsInAddresses.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadMeasurementsCountsInAddresses, true)
                        },
                    ]
                },
                {
                    label: "Дни недели", items: [
                        {
                            label: "Неделя",
                            command: this.loadMeasurementsCountsInDay.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadMeasurementsCountsInDay.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadMeasurementsCountsInDay, true)
                        },
                    ]
                },
                {
                    label: "Часы", items: [
                        {
                            label: "Неделя",
                            command: this.loadMeasurementsCountsInHour.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadMeasurementsCountsInHour.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadMeasurementsCountsInHour, true)
                        },
                    ]
                },
            ],
        },
        {
            label: "Жалобы",
            items: [
                {
                    label: "Количество", items: [
                        {
                            label: "Неделя",
                            command: this.loadComplaintsCountsInDate.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadComplaintsCountsInDate.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadComplaintsCountsInDate, true)
                        },
                    ]
                },
                {
                    label: "Адреса", items: [
                        {
                            label: "Неделя",
                            command: this.loadComplaintsCountsInAddresses.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadComplaintsCountsInAddresses.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadComplaintsCountsInAddresses, true)
                        },
                    ]
                },
                {
                    label: "Дни недели", items: [
                        {
                            label: "Неделя",
                            command: this.loadComplaintsCountsInDay.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadComplaintsCountsInDay.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadComplaintsCountsInDay, true)
                        },
                    ]
                },
                {
                    label: "Часы", items: [
                        {
                            label: "Неделя",
                            command: this.loadComplaintsCountsInHour.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadComplaintsCountsInHour.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadComplaintsCountsInHour, true)
                        },
                    ]
                },
            ],
        },
        {
            label: "Рейтинг", items: [
                {
                    label: "Адреса", items: [
                        {
                            label: "Неделя",
                            command: this.loadFeedbacksAvgInAddresses.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-7).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Месяц", command: this.loadFeedbacksAvgInAddresses.bind(this,
                                [
                                    Calendar.getDayRelativeNow(-30).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()
                                ])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadFeedbacksAvgInAddresses, true)
                        },
                    ]
                }
            ]
        },
        {
            label: "Нагрузка",
            items: [
                {
                    label: "Сеть", items: [
                        {
                            label: "Сегодня",
                            command: this.loadNetworkStatistic.bind(
                                this, [Calendar.getDayRelativeNow(0).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()])
                        },
                        {
                            label: "Вчера",
                            command: this.loadNetworkStatistic.bind(
                                this, [Calendar.getDayRelativeNow(-1).getStartDay(),
                                    Calendar.getDayRelativeNow(-1).getEndDay()])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadNetworkStatistic, false)
                        },
                    ]
                },
                {
                    label: "Процессор", items: [
                        {
                            label: "Сегодня",
                            command: this.loadCpuStatistic.bind(
                                this, [Calendar.getDayRelativeNow(0).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()])
                        },
                        {
                            label: "Вчера",
                            command: this.loadCpuStatistic.bind(
                                this, [Calendar.getDayRelativeNow(-1).getStartDay(),
                                    Calendar.getDayRelativeNow(-1).getEndDay()])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadCpuStatistic, false)
                        },
                    ]
                },
                {
                    label: "Память", items: [
                        {
                            label: "Сегодня",
                            command: this.loadRamStatistic.bind(
                                this, [Calendar.getDayRelativeNow(0).getStartDay(),
                                    Calendar.getDayRelativeNow(0).getEndDay()])
                        },
                        {
                            label: "Вчера",
                            command: this.loadRamStatistic.bind(
                                this, [Calendar.getDayRelativeNow(-1).getStartDay(),
                                    Calendar.getDayRelativeNow(-1).getEndDay()])
                        },
                        {
                            label: "Выбрать",
                            command: this.openCustomTimeRangeDialog.bind(this, this.loadRamStatistic, false)
                        },
                    ]
                },
            ],
        },
    ];
    statisticChartType = "line";
    statisticChartData = {};
    statisticChartOptions: any = configureTimeStatisticChart();

    activeSessions: ActiveSession[] = [];

    FSDayMeasurementCount = 0;
    FSMonthMeasurementCount = 0;
    FSDayComplaintCount = 0;
    FSMonthComplaintCount = 0;
    FSFeedbackCount = 0;
    FSAvgAllFeedback = 0;

    subscriptions: Subscription[] = [];

    constructor(readonly auth: AuthService, readonly dashboard: DashboardService, readonly statistic: StatisticService, readonly titleService: Title) {
    }

    statisticCustomTimeRangeCallback = (timeRange: TimeRange) => {
    };

    ngOnInit(): void {
        this.titleService.setTitle("Microel.МЕТР - Мониторинг")
        this.subscriptions.push(
            this.dashboard.getPerformance().subscribe((info) => {
                this.networkChartData = {
                    datasets: [
                        getLineDataset("RX Трафик", "#8bee74", info.receivedChartData),
                        getLineDataset("TX Трафик", "#f38955", info.transceivedChartData),
                    ],
                };
                this.cpuChartData = {
                    datasets: [
                        getLineDataset("Нагрузка", "#d61fff", info.cpuChartData),
                    ],
                };
                this.memoryChartData = {
                    datasets: [
                        getLineDataset("Занято", "#1fa2ff", info.memoryChartData),
                        getLineDataset("Всего", "#ff261f", info.totalMemoryChartData),
                    ],
                };
            }));
        this.statistic.measureCountsFromPeriod([Calendar.getDayRelativeNow(0).getStartDay()
            , Calendar.getDayRelativeNow(0).getEndMonth()]).subscribe(
            count => this.FSDayMeasurementCount = count
        );
        this.statistic.measureCountsFromPeriod([
            Calendar.getMonthRelativeNow(0).getStartMonth().getStartDay(),
            Calendar.getMonthRelativeNow(0).getEndMonth().getEndDay()]).subscribe(
            count => this.FSMonthMeasurementCount = count
        )
        this.statistic.complaintCountsFromPeriod([Calendar.getDayRelativeNow(0).getStartDay(),
            Calendar.getDayRelativeNow(0).getEndDay()]).subscribe(
            count => this.FSDayComplaintCount = count
        )
        this.statistic.complaintCountsFromPeriod([Calendar.getMonthRelativeNow(0).getStartMonth().getStartDay(),
            Calendar.getMonthRelativeNow(0).getEndMonth().getEndDay()]).subscribe(
            count => this.FSMonthComplaintCount = count
        )
        this.statistic.feedbackCounts().subscribe(n => this.FSFeedbackCount = n);
        this.statistic.feedbackAllAvg().subscribe(n => this.FSAvgAllFeedback = n);
        this.statistic.activeSessions().subscribe(
            sessions => this.activeSessions = [...sessions]
        )
        this.subscriptions.push(
            this.statistic.updateActiveSessions().subscribe(
                update => {
                    if (update.object) {
                        this.activeSessions = updateListResolver(this.activeSessions, 'id', update);
                    }
                }
            )
        )
        this.loadMeasurementsCountsInDate([Calendar.getDayRelativeNow(-7).getStartDay(), Calendar.getDayRelativeNow(0).getEndDay()])
    }

    public setCustomTimeRange(event: any) {
        if (this.statisticCalendarMode === "single") {
            if (event instanceof Date) {
                const date = ExtendDate.of(event);
                if (this.statisticCustomTimeRangeCallback) this.statisticCustomTimeRangeCallback([date.getStartDay(), date.getEndDay()]);
                this.statisticCalendarDialogVisible = false;
            }
        } else {
            if (event instanceof Array && event.every((date: any) => date instanceof Date)) {
                const dates: TimeRange = [ExtendDate.of(event[0]).getStartDay(), ExtendDate.of(event[1]).getEndDay()]
                if (this.statisticCustomTimeRangeCallback) this.statisticCustomTimeRangeCallback(dates);
                this.statisticCalendarDialogVisible = false;
            }
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
        this.subscriptions = [];
    }

    private openCustomTimeRangeDialog(callback: (timeRange: TimeRange) => void, isRangeSelection?: boolean) {
        this.statisticCalendarDialogVisible = true;
        if (isRangeSelection) {
            this.statisticCalendarMode = "range"
        } else {
            this.statisticCalendarMode = "single"
        }
        this.statisticCustomTimeRangeCallback = callback;
    }

    private loadMeasurementsCountsInDate(timeRange: TimeRange) {
        this.statisticName = 'Кол-во замеров в день'
        this.statisticChartType = 'bar'
        this.statistic.measuresCountsInDate(timeRange).subscribe(data => {
            this.statisticChartData = {
                datasets: [
                    {
                        label: "Ethernet",
                        data: data.filter(point => point.g === MeasureConnectionTypes.ETHERNET),
                        backgroundColor: "#ff961f",
                    },
                    {
                        label: "Wifi",
                        data: data.filter(point => point.g === MeasureConnectionTypes.WIFI),
                        backgroundColor: "#c31fff",
                    },
                ],
            };
            this.statisticChartOptions = configureTimeStatisticChart(timeRange[0], timeRange[1], true, true);
        });
    }

    private loadMeasurementsCountsInAddresses(timeRange: TimeRange) {

        const mapper = (address: string, data: GroupCTypeStringIntegerPoint[], type: MeasureConnectionTypes) => {
            return data.filter(point => point.x === address && point.g === type).reduce((prev, o) => prev + o.y, 0)
        }

        this.statisticName = 'Кол-во замеров топ-10 адресов'
        this.statisticChartType = 'bar'
        this.statistic.measuresCountsInAddresses(timeRange).subscribe(data => {
            let labels = data.map(point => point.x);
            labels = labels.filter((item, pos) => {
                return labels.indexOf(item) == pos;
            })
            this.statisticChartData = {
                labels,
                datasets: [
                    {
                        label: "Ethernet",
                        data: labels.map(a => mapper(a, data, MeasureConnectionTypes.ETHERNET)),
                        backgroundColor: "#ff961f",
                    },
                    {
                        label: "Wifi",
                        data: labels.map(a => mapper(a, data, MeasureConnectionTypes.WIFI)),
                        backgroundColor: "#c31fff",
                    },
                ],
            };
            this.statisticChartOptions = configureHorizontalLabelStatisticChart(true);
        });
    }

    private loadMeasurementsCountsInDay(timeRange: TimeRange) {

        const mapper = (dow: string, data: GroupCTypeStringIntegerPoint[], type: MeasureConnectionTypes) => {
            return data.filter(point => point.x === dow && point.g === type).reduce((prev, o) => prev + o.y, 0)
        }

        this.statisticName = 'Кол-во замеров по дням в неделе'
        this.statisticChartType = 'bar'
        this.statistic.measuresCountsInDays(timeRange).subscribe(data => {
            let labels = [
                "Понедельник",
                "Вторник",
                "Среда",
                "Четверг",
                "Пятница",
                "Суббота",
                "Воскресенье"
            ];
            this.statisticChartData = {
                labels,
                datasets: [
                    {
                        label: "Ethernet",
                        data: labels.map(a => mapper(a, data, MeasureConnectionTypes.ETHERNET)),
                        backgroundColor: "#ff961f",
                    },
                    {
                        label: "Wifi",
                        data: labels.map(a => mapper(a, data, MeasureConnectionTypes.WIFI)),
                        backgroundColor: "#c31fff",
                    },
                ],
            };
            this.statisticChartOptions = configureHorizontalLabelStatisticChart(true);
        });
    }

    private loadMeasurementsCountsInHour(timeRange: TimeRange) {

        this.statisticName = 'Кол-во замеров в час'
        this.statisticChartType = 'bar'
        this.statistic.measuresCountsInHour(timeRange).subscribe(data => {
            const ethHours = data.filter(p => p.g === MeasureConnectionTypes.ETHERNET).map(item => item.x);
            const preparedEth = ethHours.filter((item, pos) => {
                return ethHours.indexOf(item) === pos;
            }).map((hour, i, a) => {
                return {x: hour, y: data.filter(fp => fp.x === hour).reduce((prev, curr) => prev + curr.y, 0)};
            })
            const wifiHours = data.filter(p => p.g === MeasureConnectionTypes.WIFI).map(item => item.x);
            const preparedWifi = wifiHours.filter((item, pos) => {
                return wifiHours.indexOf(item) === pos;
            }).map((hour, i, a) => {
                return {x: hour, y: data.filter(fp => fp.x === hour).reduce((prev, curr) => prev + curr.y, 0)};
            })
            this.statisticChartData = {
                datasets: [
                    {
                        label: "Ethernet",
                        data: preparedEth,
                        backgroundColor: "#ff961f",
                    },
                    {
                        label: "Wifi",
                        data: preparedWifi,
                        backgroundColor: "#c31fff",
                    },
                ],
            };
            this.statisticChartOptions = configureLinearStatisticChart(true, 0, 23);
        });
    }

    private loadComplaintsCountsInDate(timeRange: TimeRange) {
        this.statisticName = 'Кол-во жалоб в день'
        this.statisticChartType = 'bar'
        this.statistic.complaintsCountsInDate(timeRange).subscribe(data => {
            this.statisticChartData = {
                datasets: [
                    {
                        label: "Жалобы",
                        data: data,
                        backgroundColor: "#ff391f",
                    },
                ],
            };
            this.statisticChartOptions = configureTimeStatisticChart(timeRange[0], timeRange[1], true, true);
        });
    }

    private loadComplaintsCountsInAddresses(timeRange: TimeRange) {
        this.statisticName = 'Кол-во жалоб топ-10 адресов'
        this.statisticChartType = 'bar'
        this.statistic.complaintsCountsInAddresses(timeRange).subscribe(data => {
            let labels = data.map(point => point.x);
            this.statisticChartData = {
                labels,
                datasets: [
                    {
                        label: "Жалобы",
                        data: data.map(point => point.y),
                        backgroundColor: "#ff391f",
                    },
                ],
            };
            this.statisticChartOptions = configureHorizontalLabelStatisticChart(true);
        });
    }

    private loadComplaintsCountsInDay(timeRange: TimeRange) {
        this.statisticName = 'Кол-во жалоб по дням в неделе'
        this.statisticChartType = 'bar'
        this.statistic.complaintsCountsInDays(timeRange).subscribe(data => {
            let labels = [
                "Понедельник",
                "Вторник",
                "Среда",
                "Четверг",
                "Пятница",
                "Суббота",
                "Воскресенье"
            ];
            this.statisticChartData = {
                labels,
                datasets: [
                    {
                        label: "Жалобы",
                        data: labels.map(a => data.find(p => p.x === a)?.y),
                        backgroundColor: "#ff391f",
                    },
                ],
            };
            this.statisticChartOptions = configureHorizontalLabelStatisticChart(true);
        });
    }

    private loadComplaintsCountsInHour(timeRange: TimeRange) {

        this.statisticName = 'Кол-во жалоб в час'
        this.statisticChartType = 'bar'
        this.statistic.complaintsCountsInHour(timeRange).subscribe(data => {
            const complaintHours = data.map(item => item.x);
            const preparedComplaint = complaintHours.filter((item, pos) => {
                return complaintHours.indexOf(item) === pos;
            }).map((hour, i, a) => {
                return {x: hour, y: data.filter(fp => fp.x === hour).reduce((prev, curr) => prev + curr.y, 0)};
            })
            this.statisticChartData = {
                datasets: [
                    {
                        label: "Жалобы",
                        data: preparedComplaint,
                        backgroundColor: "#ff391f",
                    },
                ],
            };
            this.statisticChartOptions = configureLinearStatisticChart(true, 0, 23);
        });
    }

    private loadFeedbacksAvgInAddresses(timeRange: TimeRange) {
        this.statisticName = 'Средний рейтинг по адресам'
        this.statisticChartType = 'bar'
        this.statistic.feedbackAvgInAddresses(timeRange).subscribe(data => {
            let labels = data.map(point => point.x);
            this.statisticChartData = {
                labels,
                datasets: [
                    {
                        label: "Рейтинг",
                        data: data.map(point => point.y),
                        backgroundColor: "#3be8a0",
                    },
                ],
            };
            this.statisticChartOptions = configureHorizontalLabelStatisticChart(true);
        });
    }

    private loadNetworkStatistic(timeRange: TimeRange) {
        this.statisticName = 'Сетевой трафик'
        this.statisticChartType = 'line'
        this.statistic.network(timeRange).subscribe(data => {
            this.statisticChartData = {
                datasets: [
                    getLineDataset("RX Трафик", "#8bee74", data.map(value => {
                        if (!value.stamp) return {x: null, y: null};
                        return {
                            x: new Date(value.stamp),
                            y: value.rx
                        }
                    })),
                    getLineDataset("TX Трафик", "#f38955", data.map(value => {
                        if (!value.stamp) return {x: null, y: null};
                        return {
                            x: new Date(value.stamp),
                            y: value.tx
                        }
                    }))
                ],
            };
            this.statisticChartOptions = configureTimeStatisticChart(timeRange[0], timeRange[1], false, false, "Мбит/с");
        });
    }

    private loadCpuStatistic(timeRange: TimeRange) {
        this.statisticName = 'Нагрузка процессора'
        this.statisticChartType = 'line'
        this.statistic.cpu(timeRange).subscribe(data => {
            this.statisticChartData = {
                datasets: [
                    getLineDataset("Нагрузка", "#d61fff", data.map(value => {
                        if (!value.stamp) return {x: null, y: null};
                        return {
                            x: new Date(value.stamp),
                            y: value.load
                        }
                    }))
                ]
            };
            this.statisticChartOptions = configureTimeStatisticChart(timeRange[0], timeRange[1], false, false, "%")
        })
    }

    private loadRamStatistic(timeRange: TimeRange) {
        this.statisticName = 'Использование оперативной памяти'
        this.statisticChartType = 'line'
        this.statistic.ram(timeRange).subscribe(data => {
            this.statisticChartData = {
                datasets: [
                    getLineDataset("Занято", "#1fa2ff", data.map(value => {
                        if (!value.stamp) return {x: null, y: null};
                        return {
                            x: new Date(value.stamp),
                            y: value.utilized
                        }
                    })),
                    getLineDataset("Всего", "#ff261f", data.map(value => {
                        if (!value.stamp) return {x: null, y: null};
                        return {
                            x: new Date(value.stamp),
                            y: value.total
                        }
                    }))
                ]
            }
            this.statisticChartOptions = configureTimeStatisticChart(timeRange[0], timeRange[1], false, false, "Мбайт")
        })
    }
}
