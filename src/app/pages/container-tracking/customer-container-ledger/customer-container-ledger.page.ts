import { Component, OnInit, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';

import { ContainerTypeService } from '../../../services/inventory-tracking/container-type.service';
import { ContainerTrackingService } from '../../../services/container-tracking/container-tracking.service';
import { CustomerService } from '../../../services/source-lists/customer.service';

import { CustomerContainerLedgerTableComponent } from '../components/customer-container-ledger-table/customer-container-ledger-table.component';
import { LedgerEntryFabComponent } from '../components/ledger-entry-fab/ledger-entry-fab.component';

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

  readonly tableRef = viewChild<CustomerContainerLedgerTableComponent>('ledgerTable');

  readonly containerTypes = computed(() => this.containerTypeService.containerTypes() || []);
  readonly customers = computed(() => this.customerService.customers() || []);
  readonly ledgerEntries = computed(() => this.containerTrackingService.customerContainerLedgerEntries());
  readonly isLoading = computed(() =>
    this.containerTrackingService.isFetchingCustomerContainerLedgers() ||
    this.containerTypeService.status() === 'fetching' ||
    this.customerService.status() === 'fetching'
  );

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
