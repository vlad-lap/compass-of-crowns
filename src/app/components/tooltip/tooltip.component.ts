import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LocationData } from '../../models';
import { Store } from '@ngxs/store';
import { GeodataState } from '../../store/geodata';

@Component({
    selector: 'cc-tooltip',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'tooltip.component.html',
    styleUrl: './tooltip.component.scss',
})
export class TooltipComponent {
    location = input.required<LocationData>();

    protected area = computed<string[]>(() => {
        const location = this.location();
        const areaKeys: (keyof LocationData)[] = [
            'islandId',
            'regionId',
            location.kingdomId ? 'kingdomId' : 'continentId',
        ];
        return areaKeys
            .map(key => this.featureNameById(location?.[key] as string))
            .filter(Boolean);
    });

    constructor(private store: Store) {}

    private featureNameById(id: string): string {
        const feature = this.store.selectSnapshot(GeodataState.byId(id));
        return feature?.properties.name;
    }
}
