import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocationData } from '../../models';
import { AreaPipe } from '../../pipes';

@Component({
    selector: 'cc-tooltip',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'tooltip.component.html',
    styleUrl: './tooltip.component.scss',
    imports: [AreaPipe],
})
export class TooltipComponent {
    location = input.required<LocationData>();
}
