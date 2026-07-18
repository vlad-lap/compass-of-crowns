import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StarIconComponent } from '../star-icon/star-icon.component';

@Component({
    selector: 'coiaf-spinner',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StarIconComponent],
    template: '<coiaf-star-icon [scale]="0.1" [animated]="true" />',
})
export class SpinnerComponent {}
