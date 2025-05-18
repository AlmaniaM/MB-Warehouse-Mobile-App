import { Component, OnInit, signal, computed, inject, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filterOutline, refreshOutline, closeCircleOutline } from 'ionicons/icons';

import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { CustomerContainerLedgerEntry, ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { Customer, CustomerService } from '../../services/source-lists/customer.service';

import { CustomerContainerLedgerTableComponent } from '../../components/customer-container-ledger-table/customer-container-ledger-table.component';
import { LedgerEntryFabComponent } from '../../components/ledger-entry-fab/ledger-entry-fab.component';

@Component({
  selector: 'app-customer-container-ledger',
  templateUrl: './customer-container-ledger.page.html',
  styleUrls: ['./customer-container-ledger.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    CustomerContainerLedgerTableComponent,
    LedgerEntryFabComponent
  ]
})
export class CustomerContainerLedgerPage implements OnInit {
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly customerService = inject(CustomerService);
  private readonly containerTrackingService = inject(ContainerTrackingService);

  readonly containerTypes = computed(() => this.containerTypeService.containerTypes() || []);
  readonly customers = computed(() => this.customerService.customers() || []);
  readonly ledgerEntries = computed(() => this.containerTrackingService.customerContainerLedgerEntries());

  readonly isLoading = computed(() => {
    return this.containerTrackingService.isFetchingCustomerContainerLedgers() ||
      this.containerTypeService.status() === 'fetching' ||
      this.customerService.status() === 'fetching';
  });

  @ViewChild('ledgerTable')
  tableRef!: CustomerContainerLedgerTableComponent;

  constructor() {
    addIcons({
      'filter-outline': filterOutline,
      'refresh-outline': refreshOutline,
      'close-circle-outline': closeCircleOutline
    });
  }

  ngOnInit() {
    this.containerTypeService.getContainerTypes();
    this.customerService.getCustomers();
    this.containerTrackingService.getAllCustomerContainerLedgerEntries();
  }

  refreshData(): void {
    this.containerTrackingService.getAllCustomerContainerLedgerEntries(true);
  }

  onLedgerEntryCreated(entry: any): void {
    this.refreshData();
  }
}
