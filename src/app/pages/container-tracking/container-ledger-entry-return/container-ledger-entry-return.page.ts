import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonItem, 
  IonList, 
  IonProgressBar
} from '@ionic/angular/standalone';

import { ContainerReturnReceipt, ContainerReturnReceiptService } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';
import { CustomerService, Customer } from 'src/app/services/inventory-tracking/sourcelists/customer.service';

import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';

@Component({
  selector: 'app-container-ledger-entry-return',
  templateUrl: './container-ledger-entry-return.page.html',
  styleUrls: ['./container-ledger-entry-return.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonProgressBar, 
    IonList, 
    IonItem, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class ContainerLedgerEntryReturnPage {

  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  customerService: CustomerService = inject(CustomerService);

  containerReturnReceiptServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.containerReturnReceiptService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => { 
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.containerReturnReceiptServiceStatus()) || ['fetching'].includes(this.customerServiceStatus())
  });

  selectedCustomerContainerLedgerEntry: Signal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntry, { initialValue: null });
  containerReturnReceipts: Signal<ContainerReturnReceipt[]> = toSignal(this.containerReturnReceiptService.containerReturnReceipts, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  containerReturnReceipt: Signal<ContainerReturnReceipt | null> = computed(() => {
    if (!this.selectedCustomerContainerLedgerEntry()) { return null; }
    if (this.containerReturnReceipts().length === 0) { return null; }

    return this.containerReturnReceipts().find(receipt => receipt.id === (this.selectedCustomerContainerLedgerEntry()! as CustomerContainerLedgerEntry).returnReceiptId)!;
  });

  containerReturnReceiptCustomer: Signal<Customer | null> = computed(() => {
    if (!this.containerReturnReceipt()) { return null; }
    if (this.customers().length === 0) { return null; }

    return this.customers().find(customer => customer.id === this.containerReturnReceipt()!.customerId)!;
  });
}
