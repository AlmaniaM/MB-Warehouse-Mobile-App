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
    loadComponent: () => import('./components/app-layout/app-layout.component').then(page => page.AppLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'container-tracking',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(page => page.HomePage)
      },
      {
        path: 'container-tracking',
        loadComponent: () => import('./components/container-tracking/container-tracking-layout/container-tracking-layout.component').then(page => page.ContainerTrackingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'mbn-ledger',
            pathMatch: 'full'
          },
          {
            path: 'mbn-ledger',
            loadComponent: () => import('./pages/container-tracking/container-ledger-entries/container-ledger-entries.page').then(page => page.ContainerLedgerEntriesPage)
          },
          {
            path: 'customer-ledger',
            loadComponent: () => import('./pages/container-tracking/customer-container-ledger-entries/customer-container-ledger-entries.page').then(page => page.CustomerContainerLedgerEntriesPage)
          },
          {
            path: 'ledger-entry',
            loadComponent: () => import('./components/container-tracking/container-ledger-entry-layout/container-ledger-entry-layout.component').then(page => page.ContainerLedgerEntryLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
              },
              {
                path: 'details',
                loadComponent: () => import('./pages/container-tracking/container-ledger-entry-details/container-ledger-entry-details.page').then(page => page.ContainerLedgerEntryDetailsPage)
              }
            ]
          },
          {
            path: 'returns',
            loadComponent: () => import('./pages/container-tracking/container-returns/container-returns.page').then(page => page.ContainerReturnsPage)
          },
          {
            path: 'return',
            loadComponent: () => import('./components/container-tracking/container-return-layout/container-return-layout.component').then(page => page.ContainerReturnLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
              },
              {
                path: 'details',
                loadComponent: () => import('./pages/container-tracking/container-return-details/container-return-details.page').then(page => page.ContainerReturnDetailsPage)
              },
              {
                path: 'ledger-entries',
                loadComponent: () => import('./pages/container-tracking/container-return-ledger-entries/container-return-ledger-entries.page').then(page => page.ContainerReturnLedgerEntriesPage)
              }
            ]
          },
        ]
      }
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
  },
];