import { Component, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { IonContent } from "@ionic/angular/standalone";

import { SelectedContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/selected-container-return-receipt.service';
import { ContainerReturnReceipt, ContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/container-return-receipt.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ContainerReturnReceiptFormComponent } from 'src/app/modules/container-tracking/components/container-return-receipt-form/container-return-receipt-form.component';

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

  router: Router = inject(Router);
  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);

  selectedContainerReturnReceipt: Signal<ContainerReturnReceipt | null> = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt, { initialValue: null });
  containerReturnReceiptPreviousDataOperation: Signal<"created" | "updated" | "deleted" | null> = toSignal(this.containerReturnReceiptService.previousDataOperationSubject, { requireSync: true });
  
  containerReturnReceiptPreviousDataOperationEffect = effect(() => {
    if (this.containerReturnReceiptPreviousDataOperation() !== 'deleted') { return; }
    this.selectedContainerReturnReceiptService.setContainerReturnReceipt(null);
    this.router.navigate(['/app/container-tracking/returns']);
  });

}
