import { Component, computed, input, signal, viewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonItem,
  IonIcon,
  IonRow,
  IonCol,
  IonButton,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonGrid
} from '@ionic/angular/standalone';
import { CustomerContainerLedgerEntry, ContainerTrackingService } from '../../../../services/container-tracking/container-tracking.service';
import { ContainerType } from '../../../../services/inventory-tracking/container-type.service';
import { Customer } from '../../../../services/source-lists/customer.service';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown, chevronDown, remove, starOutline, refresh, closeCircleOutline, filterOutline } from 'ionicons/icons';
import { DropdownSelectComponent, DropdownOption } from '../../../../components/dropdown-select/dropdown-select.component';
import { ListViewComponent } from '../../../../components/list-view/list-view.component';

@Component({
  selector: 'app-customer-container-ledger-table',
  templateUrl: './customer-container-ledger-table.component.html',
  styleUrls: ['./customer-container-ledger-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonItem,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonCard,
    IonCardContent,
    IonSpinner,
    DropdownSelectComponent,
    ListViewComponent
  ]
})
export class CustomerContainerLedgerTableComponent {
  readonly containerTypes = input<ContainerType[]>([]);
  readonly customers = input<Customer[]>([]);
  readonly ledgerEntries = input<CustomerContainerLedgerEntry[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly disableSummary = input<boolean>(false);

  readonly listView = viewChild<ListViewComponent<CustomerContainerLedgerEntry>>(ListViewComponent);

  readonly defaultExpandedAccordions = new Set(['filters', 'summary']);
  readonly selectedYear = signal<number | null>((new Date()).getFullYear());
  readonly selectedContainerTypes = signal<ContainerType[]>([]);
  readonly selectedCustomers = signal<Customer[]>([]);

  readonly yearOptions = computed<DropdownOption<number>[]>(() => this.getAvailableYears());
  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() =>
    this.containerTypes().map(type => ({
      label: type.name,
      value: type
    }))
  );
  readonly customerOptions = computed<DropdownOption<Customer>[]>(() =>
    this.customers().map(customer => ({
      label: customer.name,
      value: customer
    }))
  );

  readonly containerTypeTotals = computed(() => {
    const entries = this.filteredEntries();
    if (!entries || entries.length === 0) return 0;

    return entries.reduce((total, entry) => {
      return total + (entry.quantity || 0);
    }, 0);
  });

  readonly filteredEntries = computed(() => {
    const entries = this.ledgerEntries();
    const selectedTypes = this.selectedContainerTypes();
    const selectedCustomers = this.selectedCustomers();
    const year = this.selectedYear();
    let filtered = [...entries];

    if (selectedTypes.length > 0) {
      const typeIds = new Set(selectedTypes.map(type => type.id));
      filtered = filtered.filter(entry => entry.containerTypeId !== null && typeIds.has(entry.containerTypeId));
    }

    if (selectedCustomers.length > 0) {
      const customerIds = new Set(selectedCustomers.map(customer => customer.id));
      filtered = filtered.filter(entry => entry.customerId !== null && customerIds.has(entry.customerId));
    }

    if (year !== null) {
      filtered = filtered.filter(entry => {
        if (!entry.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year;
      });
    }

    filtered.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return filtered;
  });

  readonly hasActiveFilters = computed(() => {
    const selectedTypes = this.selectedContainerTypes();
    const selectedCustomers = this.selectedCustomers();
    const year = this.selectedYear();

    return (
      (selectedTypes && selectedTypes.length > 0) ||
      (selectedCustomers && selectedCustomers.length > 0) ||
      year !== null
    );
  });

  constructor() {
    addIcons({
      'arrow-up': arrowUp,
      'arrow-down': arrowDown,
      'chevron-down': chevronDown,
      'remove': remove,
      'close-circle-outline': closeCircleOutline,
      'refresh-outline': refresh,
    });
  }

  onYearChange(value: number | number[] | null): void {
    this.selectedYear.set(Array.isArray(value) ? null : value);
    this.refreshEntries();
  }

  onContainerTypeChange(value: ContainerType | ContainerType[] | null): void {
    this.selectedContainerTypes.set(Array.isArray(value) ? value : value ? [value] : []);
    this.refreshEntries();
  }

  onCustomerChange(value: Customer | Customer[] | null): void {
    this.selectedCustomers.set(Array.isArray(value) ? value : value ? [value] : []);
    this.refreshEntries();
  }

  refreshEntries(): void {
    if (this.listView()) {
      this.listView()!.refreshItems();
    }
  }

  resetFilters(): void {
    this.selectedYear.set(null);
    this.selectedContainerTypes.set([]);
    this.selectedCustomers.set([]);
    this.refreshEntries();
  }

  formatQuantity(quantity: number | null): string {
    return (quantity === null || quantity === undefined || quantity === 0) ? '0' : quantity > 0 ? `+${quantity}` : `${quantity}`;
  }

  getQuantityClass(quantity: number | null): string {
    if (!quantity) return '';
    return quantity > 0 ? 'positive' : 'negative';
  }

  trackByEntryId(index: number, entry: CustomerContainerLedgerEntry): number {
    return entry.id;
  }

  private getAvailableYears(): DropdownOption<number>[] {
    const years = new Set<number>();
    this.ledgerEntries().forEach(entry => {
      if (entry.date) {
        const entryDate = new Date(entry.date);
        years.add(entryDate.getFullYear());
      }
    });

    const yearArray = Array.from(years).sort((a, b) => b - a);
    return yearArray.map(year => ({
      label: year.toString(),
      value: year
    }));
  }
}
