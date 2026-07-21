import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocationData } from '../../models';
import { AreaPipe, LocalizePipe } from '../../pipes';
import { Store } from '@ngxs/store';
import { LanguagesState } from '../../store';

@Component({
    selector: 'coiaf-tooltip',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'tooltip.component.html',
    styleUrl: './tooltip.component.scss',
    imports: [AreaPipe, LocalizePipe],
})
export class TooltipComponent {
    readonly location = input.required<LocationData>();
    readonly coreUi = this.store.selectSignal(LanguagesState.coreUi);
    constructor(private store: Store) {}
}
