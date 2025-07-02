import { 
  Component, 
  computed, 
  inject, 
  input, 
  InputSignal, 
  signal, 
  Signal, 
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
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
  IonChip, IonAccordionGroup, IonAccordion } from '@ionic/angular/standalone';

import { ContainerLedgerEntryService, ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerTypeService, ContainerType } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';

import { ContainerLedgerEntryFormComponent } from 'src/app/components/container-tracking/container-ledger-entry-form/container-ledger-entry-form.component';
import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { Customer, CustomerService } from 'src/app/services/inventory-tracking/sourcelists/customer.service';

export interface ContainerLedgerEntryListRecord {
  containerLedgerEntry: ContainerLedgerEntry | CustomerContainerLedgerEntry;
  containerType: ContainerType;
  customer: Customer | null;
}
@Component({
  selector: 'app-container-ledger-entry-list',
  templateUrl: './container-ledger-entry-list.component.html',
  styleUrls: ['./container-ledger-entry-list.component.scss'],
  imports: [IonAccordion, IonAccordionGroup, 
    CommonModule,
    FormsModule,
    ScrollingModule,
    DatePipe,
    IonContent,
    IonChip, 
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
    ContainerLedgerEntryFormComponent
  ]
})
export class ContainerLedgerEntryListComponent {

  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);

  containerLedgerEntryServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.containerLedgerEntryService.status, { initialValue: 'stable' });
  containerTypeServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.containerLedgerEntryService.status, { initialValue: 'stable' });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating'].includes(this.containerLedgerEntryServiceStatus()) || ['fetching', 'creating'].includes(this.containerTypeServiceStatus());
  });

  ledgerType: InputSignal<'MBN' | 'Customer'> = input.required<'MBN' | 'Customer'>();

  containerLedgerEntries: Signal<ContainerLedgerEntry[]> = toSignal(this.containerLedgerEntryService.containerLedgerEntries, { initialValue: [] });
  customerContainerLedgerEntries: Signal<CustomerContainerLedgerEntry[]> = toSignal(this.containerLedgerEntryService.customerContainerLedgerEntries, { initialValue: [] });
  containerTypes: Signal<ContainerType[]> = toSignal(this.containerTypeService.containerTypes, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  sortedCustomers: Signal<Customer[]> = computed(() => {
    return this.customers().sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
  });

  ledgerEntries: Signal<ContainerLedgerEntry[] | CustomerContainerLedgerEntry[]> = computed(() => {
    if (this.ledgerType() === 'MBN') {
      return this.containerLedgerEntries();
    }
    return this.customerContainerLedgerEntries();
  });

  containerLedgerEntryYears: Signal<number[]> = computed(() => {
    if (this.ledgerEntries().length === 0) { return []; }

    return Array.from(new Set(
      this.ledgerEntries().map((entry) => new Date(entry.date).getFullYear())
    )).sort((a, b) => b - a);
  });

  containerLedgerEntryListRecords: Signal<ContainerLedgerEntryListRecord[]> = computed( () => { 
    if (this.ledgerEntries().length === 0) { return []; }
    if (this.containerTypes().length === 0) { return []; }
    if (this.customers().length === 0) { return []; }

    return this.ledgerEntries().map((ledgerEntry) => { 
      return {
        containerLedgerEntry: ledgerEntry,
        containerType: this.containerTypes().find((containerType) => containerType.id === ledgerEntry.containerTypeId)!,
        customer: this.ledgerType() === 'Customer' ? this.customers().find((customer) => customer.id === (ledgerEntry as CustomerContainerLedgerEntry).customerId)! : null
      }
    });
  });

  globalSearchFilter: WritableSignal<string> = signal('');
  yearFilter: WritableSignal<number> = signal(new Date().getFullYear());
  entryTypeFilter: WritableSignal<'add' | 'subtract' | null> = signal(null);
  containerTypeFilter: WritableSignal<ContainerType | null> = signal(null);
  customerFilter: WritableSignal<Customer | null> = signal(null);
  isCreatingLedgerEntry: WritableSignal<boolean> = signal(false);

  filteredContainerLedgerEntryListRecords: Signal<ContainerLedgerEntryListRecord[]> = computed(() => { 
    return this.containerLedgerEntryListRecords()
      .sort((a, b) => {
        return new Date(b.containerLedgerEntry.date).getTime() - new Date(a.containerLedgerEntry.date).getTime();
      })
      .filter((ledgerEntry) => { 
        return new Date(ledgerEntry.containerLedgerEntry.date).getFullYear() === this.yearFilter();
      })
      .filter((ledgerEntry) => { 
        if (this.globalSearchFilter() === '') { return true; } 
        return JSON.stringify(ledgerEntry).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());  
      })
      .filter((ledgerEntry) => { 
        if (!this.entryTypeFilter()) { return true; }
        if (this.entryTypeFilter() === 'add') { 
          return ledgerEntry.containerLedgerEntry.quantity > 0;
        } 
        return ledgerEntry.containerLedgerEntry.quantity < 0;
      })
      .filter((ledgerEntry) => { 
        if (!this.containerTypeFilter()) { return true; }
        return ledgerEntry.containerType.id === this.containerTypeFilter()!.id;
      })
      .filter((ledgerEntry) => { 
        if (!this.customerFilter()) { return true; }
        return (ledgerEntry.containerLedgerEntry as CustomerContainerLedgerEntry).customerId === this.customerFilter()!.id;
      });
  });

  trackByContainerLedgerEntry(index: number, ledgerEntry: ContainerLedgerEntryListRecord) { 
    return ledgerEntry.containerLedgerEntry.id;
  }

  setSelectedContainerLedgerEntry(ledgerEntry: ContainerLedgerEntryListRecord) { 
    this.selectedContainerLedgerEntryService.setContainerLedgerEntry(ledgerEntry.containerLedgerEntry);
  }
}