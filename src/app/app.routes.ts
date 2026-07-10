import { Routes } from '@angular/router';
import { mapResolver } from './resolvers';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/map-page/map-page.component').then(m => m.MapPageComponent),
        resolve: {
            data: mapResolver,
        },
    },
];
