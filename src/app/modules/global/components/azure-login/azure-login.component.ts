import { Component, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonButton, 
  IonProgressBar 
} from '@ionic/angular/standalone';

import { AzureAuthenticationService } from '../../auth/azure-auth.service';

@Component({
  selector: 'app-azure-login',
  templateUrl: './azure-login.component.html',
  styleUrls: ['./azure-login.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent, 
    IonButton, 
    IonProgressBar
  ],
})
export class AzureLoginComponent {
  azureAuthService: AzureAuthenticationService = inject(AzureAuthenticationService);
  authStatus: Signal<'loggingin' | 'loggingout' | 'loggedin' | 'loggedout' | 'error'> = toSignal(this.azureAuthService.statusSubject, { requireSync: true });
  isLoggingIn: Signal<boolean> = computed(() => {
    return this.authStatus() === 'loggingin';
  });

  login() {
    this.azureAuthService.login();
  }
}
