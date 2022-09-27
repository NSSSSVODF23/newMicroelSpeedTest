export function configureTimeStatisticChart(min?: Date, max?: Date, stacked?: boolean, onlyDay?: boolean, suffix?: string) {

    const dayFormat = {
        second: 'DD.MM.YY',
        minute: 'DD.MM.YY',
        hour: 'DD.MM.YY',
        day: 'DD.MM.YY',
        week: "DD.MM.YY"
    }

    const dateTimeFormat = {
        second: 'HH:mm:ss',
        minute: 'HH:mm',
        hour: 'DD.MM.YY HH:mm',
        day: 'DD.MM.YY',
        week: "DD.MM.YY"
    }

    return {
        plugins: {
            zoom: {
                limits: {
                    x: {min, max},
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x',
                },
                pan: {
                    enabled: true,
                    mode: "x"
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                min,
                max,
                time: {
                    displayFormats: onlyDay ? dayFormat : dateTimeFormat,
                    tooltipFormat: onlyDay ? dayFormat.day : dateTimeFormat.hour
                },
                stacked
            },
            y: {
                ticks: {
                    callback: (value: string, index: number, values: string[]) => {
                        return `${value} ${suffix ? suffix : ""}`;
                    },
                },
                stacked
            }
        },
    };
}

export function configureHorizontalLabelStatisticChart(stacked?: boolean) {
    return {
        indexAxis: 'y',
        scales: {
            y: {
                stacked
            },
        },
    };
}

export function configureOnlineChart(suffix: string) {
    return {
        animation: false,
        elements: {
            point: {
                radius: 0,
            },
        },
        scales: {
            x: {
                display: false,
                type: 'time',
            },
            y: {
                ticks: {
                    callback: (value: string, index: number, values: string[]) => {
                        return value + " " + suffix;
                    },
                },
            },
        },
    };
}

export function getLineDataset(label: string, color: string, data: any[] | undefined) {
    return {
        label,
        data,
        borderColor: color,
        borderWidth: 2,
        tension: 0.1,
    }
}