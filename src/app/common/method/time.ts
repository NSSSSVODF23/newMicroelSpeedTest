export class ExtendDate extends Date {

    public static of(date: Date | string) {
        if (typeof date === 'string') return new ExtendDate(new Date(date)); else
            return new ExtendDate(date);
    }

    public getStartDay() {
        return ExtendDate.of(new Date(this.setHours(0, 0, 0, 0)))
    }

    public getEndDay() {
        return ExtendDate.of(new Date(this.setHours(23, 59, 59, 999)))
    }

    public getStartMonth() {
        return ExtendDate.of(new Date(this.setDate(1)))
    }

    public getEndMonth() {
        return ExtendDate.of(new Date(this.setMonth(this.getMonth() + 1, 0)));
    }

    public getFormatted() {
        return `${this.getFullYear()}-${(this.getMonth() + 1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')}T${this.getHours().toString().padStart(2, '0')}:${this.getMinutes().toString().padStart(2, '0')}:${this.getSeconds().toString().padStart(2, '0')}`
    }

    public getNow() {
        return ExtendDate.of(new Date(this));
    }
}

export type TimeRange = [start: Date, end: Date];

export class Calendar {
    public static getDayRelativeNow(relativeNum: number) {
        const result = new ExtendDate();
        result.setDate(result.getDate() + relativeNum);
        return result;
    }

    public static today() {
        return new ExtendDate();
    }

    static getMonthRelativeNow(relativeNum: number) {
        const result = new ExtendDate();
        result.setMonth(result.getMonth() + relativeNum);
        return result;
    }

    public static formattedTimeRange(inputArray: string | Date[]) {
        try {
            let dateArray;
            if (inputArray instanceof Array) dateArray = inputArray;
            if (typeof inputArray === 'string') dateArray = JSON.parse(inputArray);

            if (dateArray && dateArray[0] && dateArray[1]) {
                return {
                    start: ExtendDate.of(dateArray[0]).getFormatted(),
                    end: ExtendDate.of(dateArray[1]).getEndDay().getFormatted()
                }
            }
        } catch {
        }
        return {}
    }
}

