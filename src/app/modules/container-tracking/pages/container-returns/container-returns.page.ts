import { 
  Component, 
  computed, 
  effect, 
  inject,
  signal, 
  Signal, 
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonHeader,
  IonFab, 
  IonFabButton, 
  IonSelect,
  IonModal, 
  IonProgressBar,
  IonSelectOption, 
  IonText, 
  IonNote,
  IonToolbar, 
  IonSearchbar, 
  IonButton, 
  IonButtons, 
  IonTitle,
  IonAccordionGroup, 
  IonAccordion,
} from "@ionic/angular/standalone";

import { ContainerReturnReceipt, ContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/container-return-receipt.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';

import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContainerReturnReceiptFormComponent } from 'src/app/modules/container-tracking/components/container-return-receipt-form/container-return-receipt-form.component';
import { SelectedContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/selected-container-return-receipt.service';

export interface ContainerReturnReceiptListRecord { 
  containerReturnReceipt: ContainerReturnReceipt;
  customer: Customer;
}

@Component({
  selector: 'app-container-returns',
  templateUrl: './container-returns.page.html',
  styleUrls: ['./container-returns.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    DatePipe,
    IonAccordion, 
    IonAccordionGroup, 
    IonContent,
    IonButtons, 
    IonButton, 
    IonTitle, 
    IonHeader, 
    IonList,
    IonItem, 
    IonIcon, 
    IonToolbar, 
    IonSearchbar, 
    IonLabel,
    IonFab, 
    IonFabButton, 
    IonSelect,
    IonModal, 
    IonProgressBar,
    IonSelectOption, 
    IonText, 
    IonNote, 
    ContentTopbarComponent,
    PageTopbarComponent,
    ContainerReturnReceiptFormComponent
  ]
})
export class ContainerReturnsPage {
  
  router: Router = inject(Router);
  selectedContainerReturnReceiptService:  SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  customerService: CustomerService = inject(CustomerService);

  containerReturnReceiptServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.containerReturnReceiptService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.containerReturnReceiptServiceStatus()) || ['fetching'].includes(this.customerServiceStatus());
  });

  justCreatedContainerReturnReceipt: Signal<ContainerReturnReceipt[]> = toSignal(this.containerReturnReceiptService.justCreatedContainerReturnReceipts, { initialValue: [] });
  justCreatedContainerReturnReceiptEffect = effect(() => {
    if (this.justCreatedContainerReturnReceipt().length === 0) { return; }

    this.isCreatingReturn.set(false);
    this.selectedContainerReturnReceiptService.setContainerReturnReceipt(this.justCreatedContainerReturnReceipt()[0]);
    this.router.navigate(['/app/container-tracking/return/entries']);
  });

  containerReturnReceipts: Signal<ContainerReturnReceipt[]> = toSignal(this.containerReturnReceiptService.containerReturnReceipts, { initialValue: [] });  
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  sortedCustomers: Signal<Customer[]> = computed(() => {
    return this.customers().sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
  });

  containerReturnReceiptsYears: Signal<number[]> = computed(() => {
    if (this.containerReturnReceipts().length === 0) { return []; }

    return Array.from(new Set(
      this.containerReturnReceipts().map((receipt) => new Date(receipt.date).getFullYear())
    )).sort((a, b) => b - a);
  });

  containerReturnReceiptListRecords: Signal<ContainerReturnReceiptListRecord[]> = computed(() => {
    if (this.containerReturnReceipts().length === 0) { return []; }
    if (this.customers().length === 0) { return []; }

    return this.containerReturnReceipts().map((receipt) => { 
      return {
        containerReturnReceipt: receipt,
        customer: this.customers().find((customer) => customer.id === receipt.customerId)!
      }
    });
  });

  globalSearchFilter: WritableSignal<string> = signal('');
  yearFilter: WritableSignal<number> = signal(new Date().getFullYear());
  customerFilter: WritableSignal<Customer | null> = signal(null);
  isCreatingReturn: WritableSignal<boolean> = signal(false);

  filteredContainerReturnReceiptListRecords: Signal<ContainerReturnReceiptListRecord[]> = computed(() => { 
    return this.containerReturnReceiptListRecords()
      .sort((a, b) => {
        return new Date(b.containerReturnReceipt.date).getTime() - new Date(a.containerReturnReceipt.date).getTime();
      })
      .filter((receipt) => { 
        return new Date(receipt.containerReturnReceipt.date).getFullYear() === this.yearFilter();
      })
      .filter((receipt) => { 
        if (this.globalSearchFilter() === '') { return true; } 
        return JSON.stringify(Object.values(receipt)).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());  
      })
      .filter((receipt) => { 
        if (!this.customerFilter()) { return true; }
        return receipt.customer.id === this.customerFilter()!.id;
      });
  });

  trackByContainerReturnReceipt(index: number, receipt: ContainerReturnReceiptListRecord) { 
    return receipt.containerReturnReceipt.id;
  }

  setSelectedContainerReturnReceipt(receipt: ContainerReturnReceiptListRecord) { 
    this.selectedContainerReturnReceiptService.setContainerReturnReceipt(receipt.containerReturnReceipt);
    this.router.navigate(['/app/container-tracking/return']); 
  }
}