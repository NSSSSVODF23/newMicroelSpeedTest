import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'avgOfField'
})
export class AvgOfFieldPipe implements PipeTransform {

    transform(value: any[], fieldName: string): string {
        if (!value || value.length === 0) return "0";
        const sum =
            value.reduce(
                (prev, curr) => prev + (curr[fieldName] ?? 0),
                0,
            );
        return (sum / value.length).toFixed(3).toString();
    }

}
