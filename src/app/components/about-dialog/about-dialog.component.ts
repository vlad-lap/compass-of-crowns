import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'coiaf-about-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, MatIcon, MatIconButton, MatDialogClose, MatDialogContent],
    templateUrl: './about-dialog.component.html',
    styleUrl: './about-dialog.component.scss',
})
export class AboutDialogComponent {}
