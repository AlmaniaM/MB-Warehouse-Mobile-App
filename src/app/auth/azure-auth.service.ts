import { Injectable, inject } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AccountInfo, PopupRequest, SilentRequest, InteractionStatus, InteractionRequiredAuthError } from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter, take } from 'rxjs';

import { environment } from '../../environments/environment';
import { ToastService } from '../services/utils/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AzureAuthenticationService {

  private msalGuardConfig: MsalGuardConfiguration = inject<MsalGuardConfiguration>(MSAL_GUARD_CONFIG);
  private msalService: MsalService = inject(MsalService);
  private toastService: ToastService = inject(ToastService);

  private azureAccountSubject: BehaviorSubject<AccountInfo | null> = new BehaviorSubject<AccountInfo | null>(null);
  private azureAccountProfileSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public statusSubject: BehaviorSubject<'loggingin' | 'loggingout' | 'loggedin' | 'loggedout' | 'error'> = new BehaviorSubject<'loggingin' | 'loggingout' | 'loggedin' | 'loggedout' | 'error'>('loggedout');

  public readonly azureAccount: Observable<AccountInfo | null> = this.azureAccountSubject.asObservable();
  public readonly azureAccountProfile: Observable<any> = this.azureAccountProfileSubject.asObservable();
  public readonly status: Observable<'loggingin' | 'loggingout' | 'loggedin' | 'loggedout' | 'error'> = this.statusSubject.asObservable();

  constructor() {
    this.msalService.instance.enableAccountStorageEvents();
    this.checkAccountFromCache();
  }

  fetchProfile() {
    this.statusSubject.next('loggingin');
    const profile = this.getFromLocalStorage();
    if (profile !== null) {
      this.azureAccountProfileSubject.next(profile);
      this.statusSubject.next('loggedin');
      return;
    }
    this.login();
  }

  storeProfileInLocalStorage() {
    localStorage.setItem(
      'AppAzureAccountProfile',
      JSON.stringify(this.azureAccountProfileSubject.value)
    );
  }

  getFromLocalStorage() {
    const profile = localStorage.getItem('AppAzureAccountProfile');
    if (!profile) {
      return null;
    }
    return JSON.parse(profile);
  }

  login() {
    this.statusSubject.next('loggingin');
    this.msalService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest).subscribe({
      next: response => {
        console.log(response);
        this.toastService.openToast('User has been logged in.', 500);
        this.msalService.instance.setActiveAccount(response.account);
        this.azureAccountSubject.next(response.account);
        this.statusSubject.next('loggedin');
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastService.openToast('Error while logging User in.');
        this.azureAccountSubject.next(null);
        this.statusSubject.next('error');
      }
    });
  }

  logout() {
    this.statusSubject.next('loggingout');
    this.msalService
      .logoutPopup({ mainWindowRedirectUri: environment.appBaseUrl })
      .subscribe(async () => {
        localStorage.clear();
        this.toastService.openToast('User has been logged out.');
        this.statusSubject.next('loggedout');
      });
  }

  checkAccountFromCache() {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.getCurrentAccountFromCache();
      return;
    }
    this.statusSubject.next('loggedout');
    this.azureAccountSubject.next(null);
  }

  getCurrentAccountFromCache() {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (activeAccount) {
      this.statusSubject.next('loggedin');
      this.azureAccountSubject.next(activeAccount);
    } else {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        this.msalService.instance.setActiveAccount(account);
        this.statusSubject.next('loggedin');
        this.azureAccountSubject.next(account);
      }
    }
  }

  getIsLoggedIn() { 
    return this.statusSubject.value === 'loggedin';
  }

  getAzureAccount() {
    return this.azureAccountSubject.value;
  }

  getAzureAccountProfile() { 
    return this.azureAccountProfileSubject.value;
  }

  getAccountRoles() {
    if (this.azureAccountSubject.value === null) {
      return null;
    }
    const idTokenClaims = this.azureAccountSubject.value.idTokenClaims;
    if (idTokenClaims === undefined) {
      return null;
    }
    const roles = idTokenClaims.roles;
    if (roles === undefined) {
      return null;
    }
    return roles;
  }

  isRole(role: 'Admin' | '' | '' | '') { 
    const roles = this.getAccountRoles();
    if (!roles) { return false; }
    return roles.includes(role) || roles.includes('Admin');
  }
}
