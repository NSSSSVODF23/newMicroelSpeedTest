import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'duration'
})
export class DurationPipe implements PipeTransform {

    transform(value: number, ...args: unknown[]): string {
        let second = value / 1000;
        let minute = second / 60;
        let hour = minute / 60;
        let day = Math.floor(hour / 24);
        second = Math.floor(second % 60);
        minute = Math.floor(minute % 60);
        hour = Math.floor(hour / 24);
        return `${day ? day + " дней " : ""}${hour ? hour + " часов " : ""}${minute ? minute + " минут " : ""}${second ? second + " секунд" : "0 секунд"}`
    }

}
