import { DatePipe } from '@angular/common';
import { 
  Component, 
  computed, 
  inject, 
  signal, 
  Signal, 
  WritableSignal
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
  IonChip, 
  IonFabButton, 
  IonIcon, 
  IonButton, 
  IonButtons, 
  IonToolbar, 
  IonModal, 
  IonFab, 
  IonTitle, 
  IonFooter 
} from "@ionic/angular/standalone";

import { SelectedContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/selected-container-return-receipt.service';
import { ContainerLedgerEntryService, CustomerContainerLedgerEntry } from 'src/app/modules/container-tracking/services/container-ledger.service';
import { ContainerReturnReceipt, ContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/container-return-receipt.service';
import { ContainerType, ContainerTypeService } from 'src/app/modules/sourcelists/services/container-type.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';
import { ContainerLedgerEntryListRecord } from 'src/app/modules/container-tracking/components/container-ledger-entry-list/container-ledger-entry-list.component';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryFormComponent } from 'src/app/modules/container-tracking/components/container-ledger-entry-form/container-ledger-entry-form.component';

@Component({
  selector: 'app-container-return-ledger-entries',
  templateUrl: './container-return-ledger-entries.page.html',
  styleUrls: ['./container-return-ledger-entries.page.scss'],
  imports: [
    DatePipe,
    IonFooter, 
    IonTitle, 
    IonFab, 
    IonModal, 
    IonToolbar, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonFabButton, 
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
    ContentTopbarComponent,
    ContainerLedgerEntryFormComponent
  ]
})
export class ContainerReturnLedgerEntriesPage {

  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  constainerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);
  
  containerReturnReceiptServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.containerReturnReceiptService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
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
        return entry.returnReceiptId === this.selectedContainerReturnReceipt()!.id;
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

  containerLedgerTotal: Signal<number> = computed(() => {
    return this.customerContainerLedgerEntryListRecords().reduce((total, record) => {
      return total + (record.containerLedgerEntry.quantity || 0);
    }, 0);
  });

  isCreatingLedgerEntry: WritableSignal<boolean> = signal(false);

}