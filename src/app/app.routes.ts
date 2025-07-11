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
    loadComponent: () => import('./components/app-layout/app-layout.component').then(component => component.AppLayoutComponent),
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
        path: 'budding',
        loadComponent: () => import('./components/budding/budding-layout/budding-layout.component').then(component => component.BuddingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'entries',
            pathMatch: 'full'
          },
          {
            path: 'entries',
            loadComponent: () => import('./pages/budding/budding-entries/budding-entries.page').then(page => page.BuddingEntriesPage)
          },
          {
            path: 'entry',
            loadComponent: () => import('./pages/budding/budding-entry-details/budding-entry-details.page').then(page => page.BuddingEntryDetailsPage)
          },
        ]
      },
      {
        path: 'container-tracking',
        loadComponent: () => import('./components/container-tracking/container-tracking-layout/container-tracking-layout.component').then(component => component.ContainerTrackingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'returns',
            pathMatch: 'full'
          },
          {
            path: 'returns',
            loadComponent: () => import('./pages/container-tracking/container-returns/container-returns.page').then(page => page.ContainerReturnsPage)
          },
          {
            path: 'return',
            loadComponent: () => import('./components/container-tracking/container-return-layout/container-return-layout.component').then(component => component.ContainerReturnLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'entries',
                pathMatch: 'full'
              },
              {
                path: 'entries',
                loadComponent: () => import('./pages/container-tracking/container-return-ledger-entries/container-return-ledger-entries.page').then(page => page.ContainerReturnLedgerEntriesPage)
              },
              {
                path: 'details',
                loadComponent: () => import('./pages/container-tracking/container-return-details/container-return-details.page').then(page => page.ContainerReturnDetailsPage)
              }
            ]
          },
          {
            path: 'customer-containers',
            loadComponent: () => import('./pages/container-tracking/customer-container-ledger-entries/customer-container-ledger-entries.page').then(page => page.CustomerContainerLedgerEntriesPage)
          },
          {
            path: 'mbn-containers',
            loadComponent: () => import('./pages/container-tracking/container-ledger-entries/container-ledger-entries.page').then(page => page.ContainerLedgerEntriesPage)
          },
          {
            path: 'entry',
            loadComponent: () => import('./components/container-tracking/container-ledger-entry-layout/container-ledger-entry-layout.component').then(component => component.ContainerLedgerEntryLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
              },
              {
                path: 'details',
                loadComponent: () => import('./pages/container-tracking/container-ledger-entry-details/container-ledger-entry-details.page').then(page => page.ContainerLedgerEntryDetailsPage)
              },
              {
                path: 'return',
                loadComponent: () => import('./pages/container-tracking/container-ledger-entry-return/container-ledger-entry-return.page').then(page => page.ContainerLedgerEntryReturnPage)
              },
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