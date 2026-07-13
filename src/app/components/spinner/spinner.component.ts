import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'cc-spinner',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
    templateUrl: './spinner.component.svg',
    styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {}
