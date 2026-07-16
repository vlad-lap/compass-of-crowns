import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { LocationData } from '../../models';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { GeodataState } from '../../store/geodata';
import { Store } from '@ngxs/store';

@Component({
    selector: 'cc-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, MatIconButton],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
})
export class CardComponent {
    protected readonly areaKeys: (keyof LocationData)[] = [
        'islandId',
        'regionId',
        this.data.kingdomId ? 'kingdomId' : 'continentId',
    ];

    protected readonly area = this.areaKeys
        .map(key => this.featureNameById(this.data[key] as string))
        .filter(Boolean);

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) protected data: LocationData,
        private bottomSheetRef: MatBottomSheetRef,
        private store: Store,
    ) {}

    close(): void {
        this.bottomSheetRef.dismiss();
    }

    private featureNameById(id: string): string {
        const feature = this.store.selectSnapshot(GeodataState.byId(id));
        return feature?.properties.name;
    }
}
