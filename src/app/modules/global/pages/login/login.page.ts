import { CommonModule } from '@angular/common';
import { Component, inject, Signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle } from '@ionic/angular/standalone';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { AccountInfo } from '@azure/msal-browser';
import { AzureAuthenticationService } from '../../auth/azure-auth.service';
import { AzureLoginComponent } from '../../components/azure-login/azure-login.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    PageTopbarComponent,
    ContentTopbarComponent,
    AzureLoginComponent
  ]
})
export class LoginPage {
  router: Router = inject(Router);
  toastService: ToastService = inject(ToastService);
  
  azureAuthService: AzureAuthenticationService = inject(AzureAuthenticationService);
  azureAccount: Signal<AccountInfo | null> = toSignal(this.azureAuthService.azureAccount, { initialValue: null });
  azureAccountUserEffect = effect(() => {
    if (this.azureAccount() !== null) {
      this.router.navigate(['/app']);
      return;
    }
    this.toastService.openToast('Please login to continue...');
  });
}