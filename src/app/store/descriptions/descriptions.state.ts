import { Action, createSelector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GetDescriptions } from './descriptions.actions';
import { Observable, tap } from 'rxjs';

interface DescriptionsStateModel {
    descriptions: Record<string, string>;
}

@State<DescriptionsStateModel>({
    name: 'descriptions',
    defaults: {
        descriptions: {},
    },
})
@Injectable()
export class DescriptionsState {
    static byId(id: string) {
        return createSelector([DescriptionsState], (state: DescriptionsStateModel): string => {
            return state.descriptions[id];
        });
    }

    constructor(private http: HttpClient) {}

    @Action(GetDescriptions)
    getDescriptions(
        { patchState }: StateContext<DescriptionsStateModel>,
    ): Observable<Record<string, string>> {
        return this.http
            .get<Record<string, string>>('data/descriptions.json')
            .pipe(tap(descriptions => patchState({ descriptions })));
    }
}
