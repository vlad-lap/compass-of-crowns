import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    OnInit,
    output,
    viewChild,
} from '@angular/core';
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
import { flatten, isEmpty, mapValues, omitBy } from 'lodash';
import { CommonModule, KeyValue } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SortByPipe } from '../../pipes';
import { matchesSearch } from '../../utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { APP_TITLE } from '../../constants';

type OptionGroup = GeodataType | LocationType;

const OPTIONS_GROUP_ORDER: OptionGroup[] = [
    'castles',
    'cities',
    'towns',
    'ruins',
    'other',

    'kingdoms',
    'lands',
    'wall',
    'roads',

    'continents',
    'islands',
    'seas',
    'rivers',
    'lakes',
    'mountains',
    'forests',
    'shores',
    'steppes',
    'swamps',
    'deserts',
];

@Component({
    selector: 'cc-map-search',
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
    readonly applySearch = output<FeatureData>();
    readonly resetSearch = output<void>();

    readonly searchInput = viewChild('searchInput', { read: ElementRef });

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
        private router: Router,
        private route: ActivatedRoute,
        private destroyRef: DestroyRef,
        private title: Title,
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(startWith(this.searchControl.value), takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                if (this.isFeatureData(value)) {
                    this.search(value);
                } else if (!value) {
                    this.reset();
                }
            });

        const { selected } = this.route.snapshot.queryParams;
        if (selected) {
            this.setSelectedId(selected);
        }
    }

    setSelectedId(id: string): void {
        const options = flatten(Object.values(this.options));
        const selectedOption = options.find(option => option.id === id);
        this.searchControl.patchValue(selectedOption);
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

    private search(value: FeatureData): void {
        queueMicrotask(() => this.searchInput().nativeElement.blur());
        this.applySearch.emit(value);
        this.setQueryParams(value);
        this.setTitle(value);
    }

    private reset(): void {
        this.resetSearch.emit();
        this.setQueryParams(null);
        this.setTitle(null);
    }

    private setQueryParams(value: FeatureData): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: value ? { selected: value.id } : {},
        });
    }

    private setTitle(value: FeatureData): void {
        const title = value ? `${value.name} | ${APP_TITLE}` : APP_TITLE;
        this.title.setTitle(title);
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
