import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'testingStatus'
})
export class TestingStatusPipe implements PipeTransform {

    transform(value: boolean, ...args: unknown[]): string {
        if (value) {
            return "Идет тестирование..."
        } else {
            return "Подключен"
        }
    }

}
