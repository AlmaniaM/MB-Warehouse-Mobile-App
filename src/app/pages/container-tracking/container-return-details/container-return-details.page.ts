import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent } from "@ionic/angular/standalone";

import { SelectedContainerReturnReceiptService } from 'src/app/services/cache/selected-container-return-receipt.service';
import { ContainerReturnReceipt } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';

import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContainerReturnReceiptFormComponent } from 'src/app/components/container-tracking/container-return-receipt-form/container-return-receipt-form.component';

@Component({
  selector: 'app-container-return-details',
  templateUrl: './container-return-details.page.html',
  styleUrls: ['./container-return-details.page.scss'],
  imports: [ 
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent,
    ContainerReturnReceiptFormComponent
  ]
})
export class ContainerReturnDetailsPage {

  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  selectedContainerReturnReceipt: Signal<ContainerReturnReceipt | null> = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt, { initialValue: null });

}
