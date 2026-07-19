import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { inject } from '@angular/core';
import { GetGeodata } from '../store/geodata';
import { GEODATA_URLS } from '../constants';
import { GeodataType } from '../models';

export const mapResolver: ResolveFn<void> = () => {
    const store = inject(Store);
    const actions = Object.keys(GEODATA_URLS).map((key: GeodataType) => new GetGeodata(key));
    return store.dispatch(actions);
};
