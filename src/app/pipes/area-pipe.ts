import { Pipe, PipeTransform } from '@angular/core';
import { LocationData } from '../models';
import { Store } from '@ngxs/store';
import { GeodataState } from '../store/geodata';

@Pipe({
    name: 'area',
})
export class AreaPipe implements PipeTransform {
    constructor(private store: Store) {}

    transform(location: LocationData): string[] {
        const areaKeys: (keyof LocationData)[] = [
            'islandId',
            'regionId',
            'kingdomId',
            !location.kingdomId || location.id === 'the-wall' ? 'continentId' : null,
        ];

        return areaKeys.map(key => this.featureNameById(location?.[key] as string)).filter(Boolean);
    }

    private featureNameById(id: string): string {
        const feature = this.store.selectSnapshot(GeodataState.byId(id));
        return feature?.properties.name;
    }
}
