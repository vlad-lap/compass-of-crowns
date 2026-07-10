import { Pipe, PipeTransform } from '@angular/core';
import { ListIteratee, Many, sortBy } from 'lodash';

@Pipe({
    name: 'sortBy',
})
export class SortByPipe implements PipeTransform {
    transform<T>(value: T[], ...iterates: Many<ListIteratee<T>>[]): T[] {
        return sortBy(value, ...iterates);
    }
}
