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
            redirectTo: 'ledger',
            pathMatch: 'full'
          },
          {
            path: 'ledger',
            loadComponent: () => import('./pages/container-tracking/container-ledger/container-ledger.page').then(page => page.ContainerLedgerPage)
          },
          {
            path: 'customer-ledger',
            loadComponent: () => import('./pages/container-tracking/customer-container-ledger/customer-container-ledger.page').then(page => page.CustomerContainerLedgerPage)
          },
          {
            path: 'ledger-entry-details',
            loadComponent: () => import('./pages/container-tracking/ledger-entry-details/ledger-entry-details.page').then(page => page.LedgerEntryDetailsPage)
          },
          {
            path: 'return-receipts',
            loadComponent: () => import('./pages/container-tracking/return-receipts/return-receipts.page').then(page => page.ReturnReceiptsPage)
          },
          {
            path: 'return-receipt-details',
            loadComponent: () => import('./pages/container-tracking/return-receipt-details/return-receipt-details.page').then(page => page.ReturnReceiptDetailsPage)
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
  {
    path: 'return-receipts',
    loadComponent: () => import('./pages/container-tracking/return-receipts/return-receipts.page').then( m => m.ReturnReceiptsPage)
  },
  {
    path: 'return-receipt-details',
    loadComponent: () => import('./pages/container-tracking/return-receipt-details/return-receipt-details.page').then( m => m.ReturnReceiptDetailsPage)
  },


];
