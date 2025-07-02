import { Component, computed, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { ContainerLedgerEntry, ContainerLedgerEntryService, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerReturnReceiptService } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';
import { ContainerTypeService } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';
import { CustomerService } from 'src/app/services/inventory-tracking/sourcelists/customer.service';

@Component({
  selector: 'app-container-tracking-layout',
  templateUrl: './container-tracking-layout.component.html',
  styleUrls: ['./container-tracking-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ],
})
export class ContainerTrackingLayoutComponent {

  router: Router = inject(Router);
	routerNavigationEvent: Signal<RouterEvent | null> = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)), { initialValue: null });

  isInEntryPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/ledger-entry');
  });
  
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);
  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);

  selectedContainerLedgerEntry: Signal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntry, { initialValue: null });
  selectedContainerLedgerEntryEffect = effect(() => { 
    if (!this.selectedContainerLedgerEntry()) { return; }
    this.router.navigate(['/app/container-tracking/ledger-entry']);
  });

  constructor() {
    this.containerLedgerEntryService.getContainerLedgerEntries();
    this.containerLedgerEntryService.getCustomerContainerLedgerEntries();
    this.containerLedgerEntryService.getContainerTypeQuantityTotals();
    this.containerReturnReceiptService.getContainerReturnReceipts();
    this.containerTypeService.getContainerTypes();
    this.customerService.getCustomers();
  }
}