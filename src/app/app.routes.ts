import { Routes } from '@angular/router';
import { mapResolver } from './resolvers';

export const routes: Routes = [
    {
        path: 'map',
        loadComponent: () =>
            import('./components/map/atlas-map.component').then(m => m.AtlasMapComponent),
        resolve: {
            data: mapResolver,
        },
    },
    {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
    },
];
