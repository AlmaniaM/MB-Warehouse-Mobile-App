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

import { ToggleMainMenuService } from 'src/app/modules/global/services/toggle-main-menu.service';
import { AppPage } from 'src/app/modules/global/types/app-types';

import { AccountInfo } from '@azure/msal-browser';
import { AzureAuthenticationService } from 'src/app/modules/global/auth/azure-auth.service';
import { ContainerTypeService } from 'src/app/modules/sourcelists/services/container-type.service';
import { ApiKeysService } from '../../services/api-keys.service';
import { CachedApiKeysService } from '../../services/cached-api-keys.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
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
export class AppLayoutComponent {
  toggleMainMenuService: ToggleMainMenuService = inject(ToggleMainMenuService);
  isMenuOpen: Signal<boolean> = toSignal(this.toggleMainMenuService.mainMenuIsOpen, { initialValue: true });
  appPages: AppPage[] = [
    { title: 'Home', tabLabel: 'Home', url: '/app/home', fragment: '', icon: 'home', isExternal: false, showInMenu: true },
    { title: 'Budding', tabLabel: 'Budding', url: '/app/budding', fragment: '', icon: 'leaf', isExternal: false, showInMenu: true },
    { title: 'Containers', tabLabel: 'Containers', url: '/app/container-tracking', fragment: '', icon: 'cube', isExternal: false, showInMenu: true },
    { title: 'Digging', tabLabel: 'Digging', url: '/app/digging', fragment: '', icon: 'hammer', isExternal: false, showInMenu: true },
    { title: 'Shipping', tabLabel: 'Shipping', url: '/app/shipping', fragment: '', icon: 'boat', isExternal: false, showInMenu: true },
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

  constainerTypeService: ContainerTypeService = inject(ContainerTypeService);

  constructor() {
    this.constainerTypeService.getContainerTypes();
  }

  apiKeysService: ApiKeysService = inject(ApiKeysService);
  cachedApiKeysService: CachedApiKeysService = inject(CachedApiKeysService);

  mbnReportServiceApiKey: Signal<string> = toSignal(this.apiKeysService.mbnReportServiceApiKey, { initialValue: '' });
  cachedMbnReportServiceApiKey: Signal<string | null> = toSignal(this.cachedApiKeysService.mbnReportServiceApiKey, { initialValue: null });
  cachedMbnReportServiceApiKeyEffect = effect(() => {
    if (!this.cachedMbnReportServiceApiKey()) {
      this.apiKeysService.getMbnReportServiceApiKey();
    }
    if (!this.mbnReportServiceApiKey()) { return; }
    this.cachedApiKeysService.setMbnReportServiceApiKey(this.mbnReportServiceApiKey());
  }, { allowSignalWrites: true });
}
