import { CommonModule } from '@angular/common';
import { Component, InputSignal, Signal, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonButton, IonButtons, IonHeader, IonIcon, IonImg, IonMenuToggle, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { ToggleMainMenuService } from '../../services/toggle-main-menu.service';
import { AccountInfo } from '@azure/msal-browser';
import { AzureAuthenticationService } from 'src/app/modules/global/auth/azure-auth.service';

@Component({
  selector: 'app-page-topbar',
  templateUrl: './page-topbar.component.html',
  styleUrls: ['./page-topbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonMenuToggle, 
    IonButton, 
    IonIcon, 
    IonImg
  ]
})
export class PageTopbarComponent {
  title: InputSignal<string> = input.required<string>();

  azureAuthService: AzureAuthenticationService = inject(AzureAuthenticationService);
  azureAccount: Signal<AccountInfo | null> = toSignal(this.azureAuthService.azureAccount, { initialValue: null });  
  toggleMainMenuService: ToggleMainMenuService = inject(ToggleMainMenuService);
  
  menuIsOpen: Signal<boolean> = toSignal(this.toggleMainMenuService.mainMenuIsOpen, { initialValue: false });
  toggleMenu() {
    if (window.innerWidth > 992) {
      this.toggleMainMenuService.toggleMenuIsOpen();
      return;
    }
    if (!this.menuIsOpen()) {
      this.toggleMainMenuService.toggleMenuIsOpen();
    }
  }
}