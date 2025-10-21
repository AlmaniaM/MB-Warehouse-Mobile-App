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
        redirectTo: 'home',
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
            redirectTo: 'plantings',
            pathMatch: 'full'
          },          
          {
            path: 'budding-totals',
            loadComponent: () => import('./modules/budding/pages/budding-totals/budding-totals.page').then( m => m.BuddingTotalsPage)
          },
          {
            path: 'plantings',
            loadComponent: () => import('./modules/budding/pages/planted-root-pools/planted-root-pools.page').then(page => page.PlantedRootPoolsPage)
          },
          {
            path: 'planting',
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
                loadComponent: () => import('./modules/budding/pages/planted-root-pool-details/planted-root-pool-details.page').then(page => page.PlantedRootPoolDetailsPage)
              },
              {
                path: 'budding-entry',
                loadComponent: () => import('./modules/budding/components/budding-entry-layout/budding-entry-layout.component').then(page => page.BuddingEntryLayoutComponent),
                children: [
                  {
                    path: '',
                    redirectTo: 'details',
                    pathMatch: 'full'
                  },
                  {
                    path: 'details',
                    loadComponent: () => import('./modules/budding/pages/budding-entry-details/budding-entry-details.page').then(page => page.BuddingEntryDetailsPage)
                  }
                ]
              },
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
                path: 'receipt',
                loadComponent: () => import('./modules/container-tracking/pages/container-return-receipt/container-return-receipt.page').then(page => page.ContainerReturnReceiptPage)
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
      },
      {
        path: 'digging',
        loadComponent: () => import('./modules/digging/components/digging-layout/digging-layout.component').then(component => component.DiggingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'pallets',
            pathMatch: 'full'
          },
          {
            path: 'pallets',
            loadComponent: () => import('./modules/digging/pages/pallets/pallets.page').then(page => page.PalletsPage)
          },
          {
            path: 'pallet',
            loadComponent: () => import('./modules/digging/components/pallet-details-layout/pallet-details-layout.component').then(component => component.PalletDetailsLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'contents',
                pathMatch: 'full'
              },
              {
                path: 'contents',
                loadComponent: () => import('./modules/digging/pages/pallet-contents/pallet-contents.page').then(page => page.PalletContentsPage)
              },
              {
                path: 'details',
                loadComponent: () => import('./modules/digging/pages/pallet-details/pallet-details.page').then(page => page.PalletDetailsPage)
              },
              {
                path: 'content',
                loadComponent: () => import('./modules/digging/components/pallet-content-details-layout/pallet-content-details-layout.component').then(component => component.PalletContentDetailsLayoutComponent),
                children: [
                  {
                    path: '',
                    redirectTo: 'details',
                    pathMatch: 'full'
                  },
                  {
                    path: 'details',
                    loadComponent: () => import('./modules/digging/pages/pallet-contents-details/pallet-contents-details.page').then(page => page.PalletContentsDetailsPage)
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'shipping',
        loadComponent: () => import('./modules/shipping/components/manage-shipping-layout/manage-shipping-layout.component').then(component => component.ManageShippingLayoutComponent),
        children: [
          {
            path: '',
            redirectTo: 'shipping-sheets',
            pathMatch: 'full'
          },
          {
            path: 'shipping-sheets',
            loadComponent: () => import('./modules/shipping/pages/shipping-sheets/shipping-sheets.page').then(page => page.ShippingSheetsPage),
          },
          {
            path: 'pull-sheets',
            loadComponent: () => import('./modules/shipping/pages/pull-sheets/pull-sheets.page').then(page => page.PullSheetsPage)
          },
          {
            path: 'ship-sheet',
            loadComponent: () => import('./modules/shipping/components/ship-sheet-layout/ship-sheet-layout.component').then(component => component.ShipSheetLayoutComponent),
            children: [
              {
                path: '',
                redirectTo: 'sheet',
                pathMatch: 'full'
              },
              {
                path: 'sheet',
                loadComponent: () => import('./modules/shipping/pages/ship-sheet/ship-sheet.page').then(page => page.ShipSheetPage)
              },
              {
                path: 'detail',
                loadComponent: () => import('./modules/shipping/components/ship-sheet-detail-layout/ship-sheet-detail-layout.component').then(component => component.ShipSheetDetailLayoutComponent),
                children: [
                  {
                    path: '',
                    redirectTo: 'details',
                    pathMatch: 'full'
                  },
                  {
                    path: 'details',
                    loadComponent: () => import('./modules/shipping/pages/ship-sheet-detail/ship-sheet-detail.page').then(page => page.ShipSheetDetailPage)
                  }
                ]
              }
            ]
          }
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