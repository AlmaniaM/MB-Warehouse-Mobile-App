import { DatePipe } from '@angular/common';
import { 
  Component, 
  computed, 
  inject, 
  Signal 
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { 
  IonList, 
  IonContent,
  IonHeader, 
  IonProgressBar, 
  IonItem, 
  IonLabel, 
  IonText, 
  IonNote, 
  IonChip 
} from "@ionic/angular/standalone";

import { SelectedContainerReturnReceiptService } from 'src/app/services/cache/selected-container-return-receipt.service';
import { ContainerLedgerEntryService, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerReturnReceipt, ContainerReturnReceiptService } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';
import { ContainerType, ContainerTypeService } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';
import { Customer, CustomerService } from 'src/app/services/inventory-tracking/sourcelists/customer.service';

import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryListRecord } from 'src/app/components/container-tracking/container-ledger-entry-list/container-ledger-entry-list.component';

@Component({
  selector: 'app-container-return-ledger-entries',
  templateUrl: './container-return-ledger-entries.page.html',
  styleUrls: ['./container-return-ledger-entries.page.scss'],
  imports: [
    DatePipe,
    IonChip, 
    IonNote, 
    IonText, 
    IonLabel, 
    IonContent,
    IonItem, 
    IonList, 
    IonHeader, 
    IonProgressBar,
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class ContainerReturnLedgerEntriesPage {

  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  constainerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);
  
  containerReturnReceiptServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.containerReturnReceiptService.status, { initialValue: 'stable' });
  customerServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.customerService.status, { initialValue: 'stable' });
  isFetchingData: Signal<boolean> = computed(() => { 
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.containerReturnReceiptServiceStatus()) || ['fetching'].includes(this.customerServiceStatus())
  });

  selectedContainerReturnReceipt: Signal<ContainerReturnReceipt | null> = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt, { initialValue: null });
  customerContainerLedgerEntries: Signal<CustomerContainerLedgerEntry[]> = toSignal(this.containerLedgerEntryService.customerContainerLedgerEntries, { initialValue: [] });
  containerTypes: Signal<ContainerType[]> = toSignal(this.constainerTypeService.containerTypes, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });


  selectedContainerReturnReceiptCustomer: Signal<Customer> = computed(() => {
    return this.customers().find(customer => customer.id === this.selectedContainerReturnReceipt()!.customerId)!;
  });

  customerContainerLedgerEntryListRecords: Signal<ContainerLedgerEntryListRecord[]> = computed(() => { 
    if (this.customerContainerLedgerEntries().length === 0) { return []; }
    
    return this.customerContainerLedgerEntries()
      .filter(entry => {
        return entry.containerReceiptId === this.selectedContainerReturnReceipt()!.id;
      })
      .map(entry => {
        const containerType = this.containerTypes().find(type => type.id === entry.containerTypeId)!;
        const customer = this.customers().find(customer => customer.id === entry.customerId)!;

        return {
          containerLedgerEntry: entry,
          containerType: containerType,
          customer: customer
        };
      });
  });
}