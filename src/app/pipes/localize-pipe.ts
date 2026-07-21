import { Pipe, PipeTransform } from '@angular/core';
import { FeatureData } from '../models';
import { Store } from '@ngxs/store';
import { LanguagesState } from '../store';

@Pipe({
    name: 'localize',
    pure: false,
})
export class LocalizePipe implements PipeTransform {
    constructor(private store: Store) {}

    transform<T extends FeatureData>(feature: T, property: keyof T): string {
        const language = this.store.selectSnapshot(LanguagesState.language);
        return feature?.[`${property as string}_${language}`] ?? feature?.[property] as string;
    }
}
