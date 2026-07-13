import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import {
    ActivationStart,
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    Router,
    RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpinnerComponent } from './components/spinner/spinner.component';

@Component({
    selector: 'cc-app-root',
    imports: [RouterOutlet, SpinnerComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {
    readonly loading = signal<boolean>(false);

    constructor(
        private router: Router,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit(): void {
        this.enableNavigationalLoader();
    }

    private enableNavigationalLoader(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof ActivationStart),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => this.loading.set(true));

        this.router.events
            .pipe(
                filter(event =>
                    [NavigationEnd, NavigationCancel, NavigationError].some(
                        Class => event instanceof Class,
                    ),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => this.loading.set(false));
    }
}
