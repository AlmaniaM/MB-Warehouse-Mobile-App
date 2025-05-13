import { Component, computed, effect, model, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonBadge,
  IonChip,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  refreshOutline,
  filterOutline,
  searchOutline
} from 'ionicons/icons';

import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { ContainerLedgerEntry, ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { ContainerLedgerTableComponent } from '../../components/container-ledger-table/container-ledger-table.component';
import { Customer, CustomerService } from '../../services/source-lists/customer.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { DropdownSelectComponent, DropdownOption } from '../../components/shared/dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-container-ledger',
  templateUrl: './container-ledger.page.html',
  styleUrls: ['./container-ledger.page.scss'],  standalone: true,  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonBadge,
    IonChip,
    IonIcon,
    IonSpinner,
    ContainerLedgerTableComponent,
    DropdownSelectComponent  ]
})
export class ContainerLedgerPage implements OnInit {  readonly containerTypes = toSignal(this.containerTypeService.containerTypes);
  // Using model signals to get automatic two-way binding
  readonly selectedContainerTypes = model<ContainerType[]>([]);
  readonly selectedCustomers = model<Customer[]>([]);
  readonly selectedDate = signal<string>(new Date().toISOString());
  readonly ledgerEntries = signal<ContainerLedgerEntry[]>([]);
  readonly previewFilteredCount = signal<number | null>(null);
  readonly isPreviewLoading = signal<boolean>(false);

  // Subject to debounce filter changes
  private filterChangeSubject = new Subject<void>();

  // Dropdown options
  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    const types = this.containerTypes() || [];
    return types.map(type => ({
      label: type.name,
      value: type
    }));
  });
  // Dropdown options
  readonly customerOptions = computed<DropdownOption<Customer>[]>(() => {
    const customers = this.customerService.customersList() || [];
    return customers.map(customer => ({
      label: customer.name,
      value: customer
    }));
  });
    readonly isLoading = computed(() => {
    if (this.containerTrackingService.isFetchingContainerLedgerEntries()) {
      return true;
    }

    if (this.containerTypeStatus() === 'fetching' || this.customerService.status() === 'fetching') {
      return true;
    }

    return false;
  });

  // Update filters UI to show number of selected items
  readonly selectedContainerTypesText = computed<string>(() => {
    const types = this.selectedContainerTypes();
    if (types.length === 0) return '';
    if (types.length === 1) return types[0].name;
    return `${types.length} types selected`;
  });

  readonly selectedCustomersText = computed<string>(() => {
    const customers = this.selectedCustomers();
    if (customers.length === 0) return '';
    if (customers.length === 1) return customers[0].name;
    return `${customers.length} customers selected`;
  });

  // Preview text about potential filter results
  readonly previewFilterText = computed<string>(() => {
    const previewCount = this.previewFilteredCount();
    const containerTypes = this.selectedContainerTypes();
    const customers = this.selectedCustomers();

    if (this.isPreviewLoading()) {
      return 'Calculating...';
    }

    if (previewCount === null) {
      return '';
    }

    if (containerTypes.length === 0 && customers.length === 0) {
      return '';
    }

    const filters = [];
    if (containerTypes.length > 0) {
      filters.push(`${containerTypes.length} container type${containerTypes.length > 1 ? 's' : ''}`);
    }
    if (customers.length > 0) {
      filters.push(`${customers.length} customer${customers.length > 1 ? 's' : ''}`);
    }

    return `Will return ${previewCount} ${previewCount === 1 ? 'entry' : 'entries'} for ${filters.join(' and ')}`;
  });

  // Information about filtered results
  readonly filteredEntriesText = computed<string>(() => {
    const entries = this.ledgerEntries();
    const containerTypes = this.selectedContainerTypes();
    const customers = this.selectedCustomers();

    if (containerTypes?.length === 0 && customers?.length === 0) {
      return entries.length === 1
        ? '1 entry found'
        : `${entries.length} entries found`;
    }

    const filters = [];
    if (containerTypes?.length > 0) {
      filters.push(`${containerTypes.length} container type${containerTypes.length > 1 ? 's' : ''}`);
    }
    if (customers?.length > 0) {
      filters.push(`${customers.length} customer${customers.length > 1 ? 's' : ''}`);
    }

    return `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} for ${filters.join(' and ')}`;
  });

  private readonly containerTypeStatus = toSignal(this.containerTypeService.status);

  constructor(
    private containerTypeService: ContainerTypeService,
    private containerTrackingService: ContainerTrackingService,
    private customerService: CustomerService
  ) {
    // Register icons
    addIcons({
      'close-circle-outline': closeCircleOutline,
      'refresh-outline': refreshOutline,
      'filter-outline': filterOutline,
      'search-outline': searchOutline
    });

    effect(() => {
      const ledgerEntries = this.containerTrackingService.containerLedgerEntries();
      this.ledgerEntries.set(ledgerEntries);
    });
  }

  ngOnInit() {
    this.loadContainerTypes();
    this.loadCustomers();
    this.loadLedgerEntries();

    // Setup debounced filter preview
    this.filterChangeSubject.pipe(
      debounceTime(500) // Wait 500ms after the last selection change
    ).subscribe(() => {
      this.updateFilterPreview();
    });
  }

  // Method to update filter selection and trigger preview
  onContainerTypeSelectionChange(selection: ContainerType | ContainerType[] | null) {
    // With model signals, we don't need to manually set the value
    // Just trigger the filter preview
    this.triggerFilterPreview();
  }

  // Method to update customer selection and trigger preview
  onCustomerSelectionChange(selection: Customer | Customer[] | null) {
    this.triggerFilterPreview();
  }

  // Method to trigger the debounced filter preview
  triggerFilterPreview() {
    this.filterChangeSubject.next();
  }

  // Method to update the filter preview count
  updateFilterPreview() {
    const containerTypes = this.selectedContainerTypes();
    const customers = this.selectedCustomers();

    // Skip preview if no filters are selected
    if (containerTypes.length === 0 && customers.length === 0) {
      this.previewFilteredCount.set(null);
      return;
    }

    // Extract IDs for API calls
    const containerTypeIds = containerTypes.map(type => type.id);
    const customerIds = customers.map(customer => customer.id);

    this.isPreviewLoading.set(true);

    // Use the preview method
    this.containerTrackingService.previewFilteredEntriesCount(
      containerTypeIds,
      customerIds
    ).subscribe({
      next: (count) => {
        this.previewFilteredCount.set(count);
        this.isPreviewLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting preview count:', error);
        this.isPreviewLoading.set(false);
        this.previewFilteredCount.set(null);
      }
    });
  }

  loadContainerTypes() {
    this.containerTypeService.getContainerTypes();
  }

  loadCustomers() {
    // Use the customer service to load real customer data
    this.customerService.getCustomers();
  }

  loadLedgerEntries() {
    this.containerTrackingService.getAllContainerLedgerEntries();
  }

  filterLedger() {
    const containerTypes = this.selectedContainerTypes();
    const customers = this.selectedCustomers();

    console.log('Filtering ledger by:');
    console.log('- Container Types:', containerTypes);
    console.log('- Customers:', customers);

    // Extract IDs for API calls
    const containerTypeIds = containerTypes.map(type => type.id);
    const customerIds = customers.map(customer => customer.id);

    // Use the new multi-filter method
    this.containerTrackingService.getContainerLedgerEntriesByMultipleFilters(
      containerTypeIds,
      customerIds
    );

    // Clear the preview after applying filters
    this.previewFilteredCount.set(null);
  }  resetFilters() {
    this.clearContainerTypes();
    this.clearCustomers();
    this.selectedDate.set(new Date().toISOString());
    this.previewFilteredCount.set(null);
    this.loadLedgerEntries();
  }

  // Methods to handle clearing filters
  clearContainerTypes() {
    this.selectedContainerTypes.set([]);
    this.triggerFilterPreview();
  }

  clearCustomers() {
    this.selectedCustomers.set([]);
    this.triggerFilterPreview();
  }
}
