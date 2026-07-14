import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StarIconComponent } from '../star-icon/star-icon.component';

@Component({
    selector: 'cc-spinner',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StarIconComponent],
    template: '<cc-star-icon [scale]="0.1" [animated]="true" />',
})
export class SpinnerComponent {}
