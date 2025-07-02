import { 
  Component, 
  inject, 
  Signal 
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { SelectedContainerReturnReceiptService } from 'src/app/services/cache/selected-container-return-receipt.service';
import { ContainerReturnReceipt } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';

@Component({
  selector: 'app-container-return-receipt-layout',
  templateUrl: './container-return-receipt-layout.component.html',
  styleUrls: ['./container-return-receipt-layout.component.scss'],
  imports: [
    IonTabButton, 
    IonIcon, 
    IonTabBar, 
    IonTabs 
  ]
})
export class ContainerReturnReceiptLayoutComponent  {
  
  router: Router = inject(Router);
  selectedContainerReturnReceiptService:  SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  selectedContainerReturnReceipt: Signal<ContainerReturnReceipt | null> = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt, { initialValue: null });

  goBack() {
    this.selectedContainerReturnReceiptService.setContainerReturnReceipt(null);
    this.router.navigate(['/app/container-tracking/return-receipts']);
  }
}
