import { Component, computed, inject, Signal} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

import { 
  IonList, 
  IonContent,
  IonHeader, 
  IonProgressBar, 
  IonItem, 
} from "@ionic/angular/standalone";

import { SelectedContainerReturnReceiptService } from '../../services/selected-container-return-receipt.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';
import { ContainerReturnReceipt } from '../../services/container-return-receipt.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ContainerTrackingReturnReceiptReportComponent } from "../../components/container-tracking-return-receipt-report/container-tracking-return-receipt-report.component";

@Component({
  selector: 'app-container-return-receipt',
  templateUrl: './container-return-receipt.page.html',
  styleUrls: ['./container-return-receipt.page.scss'],
  standalone: true,
  imports: [
    DatePipe,
    IonList, 
    IonContent,
    IonHeader, 
    IonProgressBar, 
    IonItem, 
    PageTopbarComponent,
    ContentTopbarComponent,
    ContainerTrackingReturnReceiptReportComponent
  ]
})
export class ContainerReturnReceiptPage {

  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  customerService: CustomerService = inject(CustomerService);
  
  customerServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => { 
    return ['fetching'].includes(this.customerServiceStatus());
  });

  selectedContainerReturnReceipt: Signal<ContainerReturnReceipt | null> = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt, { initialValue: null })
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  selectedContainerReturnReceiptCustomer: Signal<Customer> = computed(() => {
    return this.customers().find(customer => customer.id === this.selectedContainerReturnReceipt()!.customerId)!;
  });
}
