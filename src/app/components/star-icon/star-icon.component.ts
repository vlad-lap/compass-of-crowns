import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'coiaf-star-icon',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './star-icon.component.svg',
    styleUrl: './star-icon.component.scss',
    host: {
        '[style.transform]': 'hostTransform()',
    },
})
export class StarIconComponent {
    scale = input<number>(1);
    animated = input<boolean>(false);

    protected hostTransform = computed<string>(() => `scale(${this.scale()})`);
}
