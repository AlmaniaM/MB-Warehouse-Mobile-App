import { Component, computed, effect, OnInit, signal } from '@angular/core';
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
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  refreshOutline,
  filterOutline
} from 'ionicons/icons';

import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { ContainerLedgerEntry, ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { ContainerLedgerTableComponent } from '../../components/container-ledger-table/container-ledger-table.component';
import { Customer, CustomerService } from '../../services/source-lists/customer.service';
import { DropdownOption, DropdownSelectComponent } from '../../components/shared/dropdown-select/dropdown-select.component';
import { toSignal } from '@angular/core/rxjs-interop';

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
    ContainerLedgerTableComponent,
    DropdownSelectComponent
  ]
})
export class ContainerLedgerPage implements OnInit {  readonly containerTypes = toSignal(this.containerTypeService.containerTypes);
  readonly selectedContainerTypes = signal<ContainerType[]>([]);
  readonly selectedCustomers = signal<Customer[]>([]);
  readonly selectedDate = signal<string>(new Date().toISOString());
  readonly ledgerEntries = signal<ContainerLedgerEntry[]>([]);

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

  // Information about filtered results
  readonly filteredEntriesText = computed<string>(() => {
    const entries = this.ledgerEntries();
    const containerTypes = this.selectedContainerTypes();
    const customers = this.selectedCustomers();

    if (containerTypes.length === 0 && customers.length === 0) {
      return entries.length === 1
        ? '1 entry found'
        : `${entries.length} entries found`;
    }

    const filters = [];
    if (containerTypes.length > 0) {
      filters.push(`${containerTypes.length} container type${containerTypes.length > 1 ? 's' : ''}`);
    }
    if (customers.length > 0) {
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
      'filter-outline': filterOutline
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

    // Add direct event listeners if needed
    setTimeout(() => {
      const filterBtn = document.getElementById('filterBtn');
      const resetBtn = document.getElementById('resetBtn');

      if (filterBtn) {
        filterBtn.addEventListener('click', () => this.filterLedger());
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetFilters());
      }
    }, 1000);
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
  }  filterLedger() {
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
  }

  resetFilters() {
    this.selectedContainerTypes.set([]);
    this.selectedCustomers.set([]);
    this.selectedDate.set(new Date().toISOString());
    this.loadLedgerEntries();
  }
}
