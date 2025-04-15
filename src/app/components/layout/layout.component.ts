import { Component, Signal, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonContent, 
  IonSplitPane, 
  IonIcon, 
  IonMenu, 
  IonProgressBar, 
  IonList, 
  IonListHeader, 
  IonLabel, 
  IonNote, 
  IonMenuToggle, 
  IonItem, 
  IonRouterOutlet 
} from '@ionic/angular/standalone';

import { ToggleMainMenuService } from 'src/app/services/cache/toggle-main-menu.service';
import { AppPage } from 'src/app/types/app-types';

import { AccountInfo } from '@azure/msal-browser';
import { AzureAuthenticationService } from 'src/app/auth/azure-auth.service';
import { ManufacturerService } from 'src/app/services/chemical-product/manufacturer.service';
import { ChemicalProductService } from 'src/app/services/chemical-product/chemical-product.service';
import { ChemicalProductSageSkuService } from 'src/app/services/chemical-product/chemical-product-sage-sku.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    IonIcon,
    IonSplitPane,
    IonContent,
    IonMenu,
    IonProgressBar,
    IonList,
    IonListHeader,
    IonLabel,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonRouterOutlet,
  ],
})
export class LayoutComponent {
  toggleMainMenuService: ToggleMainMenuService = inject(ToggleMainMenuService);
  isMenuOpen: Signal<boolean> = toSignal(this.toggleMainMenuService.mainMenuIsOpen, { initialValue: true });
  appPages: AppPage[] = [
    { title: 'Chemicals', tabLabel: 'Chemicals', url: '/app/chemicals', fragment: '', icon: 'flask', isExternal: false, showInMenu: true },
  ];

  azureAuthService: AzureAuthenticationService = inject(AzureAuthenticationService);
  azureAccount: Signal<AccountInfo | null> = toSignal(this.azureAuthService.azureAccount, { initialValue: null });
  authStatus: Signal<'loggingin' | 'loggingout' | 'loggedin' | 'loggedout' | 'error'> = toSignal(this.azureAuthService.statusSubject, { requireSync: true });

  isLoggingOut: Signal<boolean> = computed(() => {
    return this.authStatus() === 'loggingout';
  });

  logout() {
    setTimeout(() => {
      this.azureAuthService.logout();
    }, 500);
  }

  manufacturerService: ManufacturerService = inject(ManufacturerService);
  chemicalProductService: ChemicalProductService = inject(ChemicalProductService);
  chemicalProductSageSkuService: ChemicalProductSageSkuService = inject(ChemicalProductSageSkuService);

  constructor() {
    this.manufacturerService.getManufacturers();
    this.chemicalProductService.getChemicalProducts();
    this.chemicalProductSageSkuService.getChemicalProductSageSkus();
  }
}
