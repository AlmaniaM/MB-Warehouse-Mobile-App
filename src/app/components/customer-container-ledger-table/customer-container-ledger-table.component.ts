import { Component, computed, effect, input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonAccordionGroup,
  IonAccordion,
  IonBadge,
  IonButton,
  IonLabel
} from '@ionic/angular/standalone';
import { CustomerContainerLedgerEntry } from '../../services/container-tracking/container-tracking.service';
import { ContainerType } from '../../services/inventory-tracking/container-type.service';
import { Customer } from '../../services/source-lists/customer.service';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown, chevronDown } from 'ionicons/icons';
import { DropdownSelectComponent, DropdownOption } from '../dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-customer-container-ledger-table',
  templateUrl: './customer-container-ledger-table.component.html',
  styleUrls: ['./customer-container-ledger-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonItem,
    IonList,
    IonSpinner,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonAccordionGroup,
    IonAccordion,
    IonBadge,
    IonButton,
    IonLabel,
    DropdownSelectComponent
  ]
})
export class CustomerContainerLedgerTableComponent {
  readonly containerTypes = input<ContainerType[]>([]);
  readonly customers = input<Customer[]>([]);
  readonly ledgerEntries = input<CustomerContainerLedgerEntry[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly disableSummary = input<boolean>(false);

  readonly defaultExpandedAccordions = new Set(['filters', 'summary']);

  readonly displayedEntries = signal<CustomerContainerLedgerEntry[]>([]);
  readonly pageSize = signal<number>(15);
  readonly currentPage = signal<number>(0);
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

  readonly quantityTotals = computed(() => {
    const entries = this.filteredEntries();
    let total = 0;
    let received = 0;
    let shipped = 0;

    entries.forEach(entry => {
      if (entry.quantity) {
        total += entry.quantity;
        if (entry.quantity > 0) {
          received += entry.quantity;
        } else if (entry.quantity < 0) {
          shipped += Math.abs(entry.quantity);
        }
      }
    });

    return { total, received, shipped };
  });

  readonly filteredEntries = computed(() => {
    const entries = this.ledgerEntries();
    let filtered = [...entries];

    // Filter by container type
    const selectedTypes = this.selectedContainerTypes();
    if (selectedTypes.length > 0) {
      const typeIds = new Set(selectedTypes.map(type => type.id));
      filtered = filtered.filter(entry => entry.containerTypeId !== null && typeIds.has(entry.containerTypeId));
    }

    // Filter by customer
    const selectedCustomers = this.selectedCustomers();
    if (selectedCustomers.length > 0) {
      const customerIds = new Set(selectedCustomers.map(customer => customer.id));
      filtered = filtered.filter(entry => entry.customerId !== null && customerIds.has(entry.customerId));
    }

    // Filter by year
    const year = this.selectedYear();
    if (year !== null) {
      filtered = filtered.filter(entry => {
        if (!entry.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year;
      });
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return filtered;
  });

  readonly hasMoreEntries = computed(() =>
    this.filteredEntries().length > this.displayedEntries().length
  );

  readonly isEmpty = computed(() =>
    !this.isLoading() && this.filteredEntries().length === 0
  );

  readonly hasEntries = computed(() =>
    !this.isLoading() && this.filteredEntries().length > 0
  );

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
      'chevron-down': chevronDown
    });

    // Update displayed entries when inputs change
    effect(() => {
      const entries = this.ledgerEntries();
      const types = this.containerTypes();
      const customerList = this.customers();
      const isLoading = this.isLoading();

      if (entries.length > 0 && !isLoading) {
        this.currentPage.set(0);
        this.displayedEntries.set([]);

        const filtered = this.filteredEntries();
        if (filtered.length > 0) {
          const startIndex = 0;
          const endIndex = this.pageSize();
          const newItems = filtered.slice(startIndex, endIndex);
          this.displayedEntries.set(newItems);
          this.currentPage.set(1);
        }
      }
    });

    // Initialize with current year if available
    const currentYear = new Date().getFullYear();
    setTimeout(() => {
      const years = this.yearOptions();
      if (years.find(option => option.value === currentYear)) {
        this.selectedYear.set(currentYear);
      } else if (years.length > 0) {
        this.selectedYear.set(years[0].value);
      }
    }, 0);
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

  calculateRunningBalance(entry: CustomerContainerLedgerEntry): number {
    if (!entry.containerTypeId || !entry.customerId) return 0;

    const typeId = entry.containerTypeId;
    const customerId = entry.customerId;

    // Get all entries for this container type and customer, sorted by date ascending
    const relevantEntries = this.ledgerEntries()
      .filter(e => e.containerTypeId === typeId && e.customerId === customerId && e.date)
      .sort((a, b) => {
        if (!a.date) return -1;
        if (!b.date) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    // Find the index of the current entry in the chronologically sorted list
    const entryIndex = relevantEntries.findIndex(e => e.id === entry.id);
    if (entryIndex === -1) return 0;

    // Calculate the running sum up to and including the current entry
    let runningSum = 0;
    for (let i = 0; i <= entryIndex; i++) {
      const qty = relevantEntries[i].quantity;
      if (qty !== null && qty !== undefined) {
        runningSum += qty;
      }
    }

    return runningSum;
  }

  loadMoreData(event?: any): void {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    const filtered = this.filteredEntries();

    if (startIndex < filtered.length) {
      const newItems = filtered.slice(startIndex, endIndex);

      if (this.currentPage() === 0) {
        this.displayedEntries.set(newItems);
      } else {
        this.displayedEntries.set([...this.displayedEntries(), ...newItems]);
      }

      this.currentPage.set(this.currentPage() + 1);
    }

    if (event) {
      event.target.complete();

      if (endIndex >= filtered.length) {
        event.target.disabled = true;
      }
    }
  }

  onYearChange(value: number | number[] | null): void {
    this.selectedYear.set(Array.isArray(value) ? null : value);
    this.loadMoreData();
  }

  onContainerTypeChange(value: ContainerType | ContainerType[] | null): void {
    this.selectedContainerTypes.set(Array.isArray(value) ? value : value ? [value] : []);
    this.loadMoreData();
  }

  onCustomerChange(value: Customer | Customer[] | null): void {
    this.selectedCustomers.set(Array.isArray(value) ? value : value ? [value] : []);
    this.loadMoreData();
  }

  refreshEntries(): void {
    this.currentPage.set(0);
    this.loadMoreData();
  }

  applyFilters(): void {
    this.loadMoreData();
  }

  resetFilters(): void {
    this.selectedYear.set(null);
    this.selectedContainerTypes.set([]);
    this.selectedCustomers.set([]);
  }

  readonly getQuantityColor = (quantity: number | null): string =>
    (quantity === null || quantity === undefined || quantity === 0) ? 'medium' : quantity > 0 ? 'success' : 'danger';

  readonly formatQuantity = (quantity: number | null): string =>
    (quantity === null || quantity === undefined || quantity === 0) ? '0' : quantity > 0 ? `+${quantity}` : `${quantity}`;

  readonly getQuantityArrow = (quantity: number | null): string =>
    (quantity === null || quantity === undefined || quantity === 0) ? '' : quantity > 0 ? 'arrow-up' : 'arrow-down';
}
