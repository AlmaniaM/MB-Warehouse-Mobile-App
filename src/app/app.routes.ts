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
    loadComponent: () => import('./modules/global/pages/login/login.page').then(page => page.LoginPage)
  },
  {
    path: 'app',
    canActivate: [MsalGuard],
    loadComponent: () => import('./modules/global/components/app-layout/app-layout.component').then(component => component.AppLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'container-tracking',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./modules/global/pages/home/home.page').then(page => page.HomePage)
      },
      {
        path: 'budding',
        loadComponent: () => import('./modules/budding/components/budding-layout/budding-layout.component').then(component => component.BuddingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'planted-root-pools',
            pathMatch: 'full'
          },
          {
            path: 'planted-root-pools',
            loadComponent: () => import('./modules/budding/pages/planted-root-pools/planted-root-pools.page').then(page => page.PlantedRootPoolsPage)
          },
          {
            path: 'planted-root-pool',
            loadComponent: () => import('./modules/budding/components/planted-root-pool-layout/planted-root-pool-layout.component').then(page => page.PlantedRootPoolLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'budding-entries',
                pathMatch: 'full'
              },
              {
                path: 'budding-entries',
                loadComponent: () => import('./modules/budding/pages/budding-entries/budding-entries.page').then(page => page.BuddingEntriesPage)
              },
              {
                path: 'details',
                loadComponent: () => import('./modules/container-tracking/pages/container-return-details/container-return-details.page').then(page => page.ContainerReturnDetailsPage)
              }
            ]
          }
        ]
      },
      {
        path: 'container-tracking',
        loadComponent: () => import('./modules/container-tracking/components/container-tracking-layout/container-tracking-layout.component').then(component => component.ContainerTrackingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'returns',
            pathMatch: 'full'
          },
          {
            path: 'returns',
            loadComponent: () => import('./modules/container-tracking/pages/container-returns/container-returns.page').then(page => page.ContainerReturnsPage)
          },
          {
            path: 'return',
            loadComponent: () => import('./modules/container-tracking/components/container-return-layout/container-return-layout.component').then(component => component.ContainerReturnLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'entries',
                pathMatch: 'full'
              },
              {
                path: 'entries',
                loadComponent: () => import('./modules/container-tracking/pages/container-return-ledger-entries/container-return-ledger-entries.page').then(page => page.ContainerReturnLedgerEntriesPage)
              },
              {
                path: 'details',
                loadComponent: () => import('./modules/container-tracking/pages/container-return-details/container-return-details.page').then(page => page.ContainerReturnDetailsPage)
              }
            ]
          },
          {
            path: 'customer-containers',
            loadComponent: () => import('./modules/container-tracking/pages/customer-container-ledger-entries/customer-container-ledger-entries.page').then(page => page.CustomerContainerLedgerEntriesPage)
          },
          {
            path: 'mbn-containers',
            loadComponent: () => import('./modules/container-tracking/pages/container-ledger-entries/container-ledger-entries.page').then(page => page.ContainerLedgerEntriesPage)
          },
          {
            path: 'entry',
            loadComponent: () => import('./modules/container-tracking/components/container-ledger-entry-layout/container-ledger-entry-layout.component').then(component => component.ContainerLedgerEntryLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
              },
              {
                path: 'details',
                loadComponent: () => import('./modules/container-tracking/pages/container-ledger-entry-details/container-ledger-entry-details.page').then(page => page.ContainerLedgerEntryDetailsPage)
              },
              {
                path: 'return',
                loadComponent: () => import('./modules/container-tracking/pages/container-ledger-entry-return/container-ledger-entry-return.page').then(page => page.ContainerLedgerEntryReturnPage)
              },
            ]
          },
        ]
      }
    ]
  },
  {
    path: 'not-found',
    loadComponent: () => import('./modules/global/pages/not-found/not-found.page').then(page => page.NotFoundPage)
  },
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full'
  },
];