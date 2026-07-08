import { FeatureCollection, Feature, Point, Polygon, MultiPolygon } from 'geojson';
import { Action, createSelector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GetGeodata } from './geodata.actions';
import { Observable, tap } from 'rxjs';
import { GEODATA_URLS } from '../../constants';
import { GeodataDict, GeodataType } from '../../models';
import { getCentralPoint } from '../../utils';

const EMPTY: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };

type GeodataStateModel = GeodataDict<FeatureCollection>;

@State<GeodataStateModel>({
    name: 'geodata',
    defaults: {},
})
@Injectable()
export class GeodataState {
    static geodata(key: GeodataType) {
        return createSelector(
            [GeodataState],
            (state: GeodataStateModel): FeatureCollection => state[key],
        );
    }

    static labelPoints(key: GeodataType) {
        return createSelector(
            [GeodataState],
            (state: GeodataStateModel): FeatureCollection<Point> => {
                const collection = state[key];
                if (!collection) {
                    return EMPTY;
                }

                const features: Feature<Point>[] = collection.features
                    .filter(feature => feature.properties?.name)
                    .map(feature => ({
                        ...feature,
                        geometry: {
                            type: 'Point',
                            coordinates: getCentralPoint(
                                feature.geometry as Polygon | MultiPolygon,
                            ),
                        },
                    }));

                return { ...collection, features };
            },
        );
    }

    constructor(private http: HttpClient) {}

    @Action(GetGeodata)
    getGeodata(
        { patchState }: StateContext<GeodataStateModel>,
        { key }: GetGeodata,
    ): Observable<FeatureCollection> {
        return this.http
            .get<FeatureCollection>(GEODATA_URLS[key])
            .pipe(tap(geodata => patchState({ [key]: geodata })));
    }
}
