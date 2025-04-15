import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(page => page.LoginPage)
  },
  {
    path: 'app',
    canActivate: [MsalGuard],
    loadComponent: () => import('./components/layout/layout.component').then(page => page.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(page => page.HomePage)
      },
    ]
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.page').then(page => page.NotFoundPage)
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full'
  }
];