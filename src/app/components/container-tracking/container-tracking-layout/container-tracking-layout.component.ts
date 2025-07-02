import { Component, inject } from '@angular/core';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { ContainerLedgerEntryService } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerReturnReceiptService } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';
import { ContainerTypeService } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';
import { CustomerService } from 'src/app/services/inventory-tracking/sourcelists/customer.service';

@Component({
  selector: 'app-container-tracking-layout',
  templateUrl: './container-tracking-layout.component.html',
  styleUrls: ['./container-tracking-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ],
})
export class ContainerTrackingLayoutComponent {

  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);

  constructor() {
    this.containerLedgerEntryService.getContainerLedgerEntries();
    this.containerLedgerEntryService.getCustomerContainerLedgerEntries();
    this.containerLedgerEntryService.getContainerTypeQuantityTotals();
    this.containerReturnReceiptService.getContainerReturnReceipts();
    this.containerTypeService.getContainerTypes();
    this.customerService.getCustomers();
  }
}