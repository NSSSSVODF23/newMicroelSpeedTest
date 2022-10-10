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

/**
 * Принимает строку, конвертирует в число, если числом не является, то устанавливает значение по умолчанию
 */
export function stringToInt(value: string, def: number) {
    const converted = parseInt(value)
    if (isNaN(converted)) {
        return def;
    } else {
        return converted;
    }
}

export function getAvgMaxFromArray(array: number[], windowSize: number = 30, percentFall: number = 10) {
    console.log(array)
    if (!array || array.length === 0) return 0;
    const preparedArray = array
        .sort((a, b) => b - a)
        .filter((value, index, array) => {
            const startIndex = Math.round(array.length * (percentFall / 100));
            const endIndex = Math.round(array.length * (1 - percentFall / 100));
            return index >= startIndex && index <= endIndex;
        })
        .slice(0, windowSize)
    console.log(preparedArray)
    return preparedArray.reduce((prev, curr) => prev + curr, 0) / preparedArray.length;
}
