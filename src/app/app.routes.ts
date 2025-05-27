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
        redirectTo: 'containers',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(page => page.HomePage)
      },
      {
        path: 'containers',
        loadComponent: () => import('./pages/container-tracking/container-tracking.page').then(page => page.ContainerTrackingPage),
        children: [
          {
            path: '',
            redirectTo: 'ledger',
            pathMatch: 'full'
          },
          {
            path: 'send',
            loadComponent: () => import('./pages/send-containers/send-containers.page').then(page => page.SendContainersPage)
          },
          {
            path: 'receive',
            loadComponent: () => import('./pages/receive-containers/receive-containers.page').then(page => page.ReceiveContainersPage)
          },
          {
            path: 'ledger',
            loadComponent: () => import('./pages/container-tracking/container-ledger/container-ledger.page').then(page => page.ContainerLedgerPage)
          }, {
            path: 'customer-ledger',
            loadComponent: () => import('./pages/container-tracking/customer-container-ledger/customer-container-ledger.page').then(page => page.CustomerContainerLedgerPage)
          },
          {
            path: 'receipts',
            loadComponent: () => import('./pages/container-tracking/receipts/receipts.page').then(page => page.ReceiptsPage)
          },
          {
            path: 'ledger-summary',
            loadComponent: () => import('./pages/container-tracking/ledger-summary/ledger-summary.page').then(page => page.LedgerSummaryPage)
          }
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
