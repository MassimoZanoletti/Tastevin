import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), title: 'Tastevin' },
  { path: 'degustazione', loadComponent: () => import('./pages/tasting/tasting.component').then(m => m.TastingComponent), title: 'Degustazione · Tastevin' },
  { path: 'degustazione/:id', loadComponent: () => import('./pages/tasting/tasting.component').then(m => m.TastingComponent), title: 'Modifica · Tastevin' },
  { path: 'archivio', loadComponent: () => import('./pages/archive/archive.component').then(m => m.ArchiveComponent), title: 'Archivio · Tastevin' },
  { path: 'archivio/:id', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent), title: 'Degustazione · Tastevin' },
  { path: '**', redirectTo: '' },
];
