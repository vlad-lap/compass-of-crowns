import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, output } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import {
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOptgroup,
    MatOption,
} from '@angular/material/autocomplete';
import { Store } from '@ngxs/store';
import { GeodataState } from '../../store/geodata';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { FeatureData, GeodataType, LocationType } from '../../models';
import { isEmpty, mapValues, omitBy } from 'lodash';
import { CommonModule, KeyValue } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SortByPipe } from '../../pipes';
import { matchesSearch } from '../../utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type OptionGroup = GeodataType | LocationType;

const OPTIONS_GROUP_ORDER: OptionGroup[] = [
    'castles',
    'cities',
    'towns',
    'ruins',
    'other',

    'kingdoms',
    'wall',
    'roads',

    'rivers',
    'lakes',
    'mountains',
    'forests',
    'islands',
];

@Component({
    selector: 'aif-map-search',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInput,
        MatIcon,
        MatAutocomplete,
        MatAutocompleteTrigger,
        MatOptgroup,
        MatOption,
        MatIconButton,
        SortByPipe,
    ],
    templateUrl: './map-search.component.html',
    styleUrl: './map-search.component.scss',
})
export class MapSearchComponent implements OnInit {
    applySearch = output<FeatureData>();
    resetSearch = output<void>();

    readonly options = this.store.selectSnapshot(GeodataState.searchOptions);
    readonly searchControl = new FormControl<FeatureData | string>('');

    readonly filteredOptions$: Observable<Record<string, FeatureData[]>> =
        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            map(() =>
                mapValues(this.options, features =>
                    features.filter(feature => this.matchesSearch(feature)),
                ),
            ),
            map(options => omitBy(options, isEmpty)),
        );

    constructor(
        private store: Store,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(startWith(this.searchControl.value), takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                if (this.isFeatureData(value)) {
                    this.applySearch.emit(value);
                } else if (!value) {
                    this.resetSearch.emit();
                }
            });
    }

    reset(): void {
        this.searchControl.reset('');
    }

    displayFn(option: FeatureData): string {
        return option?.name;
    }

    sortOptionsGroup(
        { key: key1 }: KeyValue<OptionGroup, FeatureData[]>,
        { key: key2 }: KeyValue<OptionGroup, FeatureData[]>,
    ): number {
        return OPTIONS_GROUP_ORDER.indexOf(key1) - OPTIONS_GROUP_ORDER.indexOf(key2);
    }

    private matchesSearch({ searchKeys }: FeatureData): boolean {
        const searchValue = this.searchControl.value;
        const query = this.isFeatureData(searchValue) ? searchValue.name : searchValue;
        return !!query && matchesSearch(searchKeys, query);
    }

    private isFeatureData(value: FeatureData | string): value is FeatureData {
        return typeof value === 'object' && 'id' in value;
    }
}
