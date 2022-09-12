/**
 * Rounds the value to a certain accuracy
 * @param {number} value The value that needs to be rounded
 * @param {number} precision Accuracy of the rounding
 * @returns Rounded number
 */
export function roundToPrecision(value: number, precision: number): number {
	const divider = Math.pow(10, precision);
	return Math.round((value + Number.EPSILON) * divider) / divider;
}

/**
 * Counts the speed at which data loaded
 * @param {number} loadedBytes Current volume of uploaded bytes
 * @param {number} prevBytesCount The amount of data obtained on the previous tick
 * @param {number} startDatetime Date and time when downloading
 * @param {number} endDatetime Date and time when the load is over
 */
export function speedCalc(
	loadedBytes: number,
	prevBytesCount: number,
	startDatetime: number,
	endDatetime?: number,
) {
	const now = endDatetime !== undefined ? endDatetime : performance.now();
	const deltaSec = (now - startDatetime) / 1000;
	return ((loadedBytes - prevBytesCount) * 8) / 1000000 / deltaSec;
}

export function getChartOptions(suffix: string) {
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
