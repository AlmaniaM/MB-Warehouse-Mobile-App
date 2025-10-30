import { 
  Component, 
  inject, 
  Signal 
} from '@angular/core';
import { Router } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { SelectedShippingSheetDetailService } from 'src/app/modules/shipping/services/selected-shipping-sheet-detail.service';
import { ShippingSheetContent } from 'src/app/modules/shipping/services/shipping-sheet-detail.service';

@Component({
  selector: 'app-shipping-sheet-content-layout',
  templateUrl: './shipping-sheet-content-layout.component.html',
  styleUrls: ['./shipping-sheet-content-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ]
})
export class ShippingSheetContentLayoutComponent  {
  
  router: Router = inject(Router);
  selectedShippingSheetDetailService: SelectedShippingSheetDetailService = inject(SelectedShippingSheetDetailService);

  selectedShippingSheetDetail: Signal<ShippingSheetContent | null> = this.selectedShippingSheetDetailService.selectedShippingSheetDetail;

  goBack() {
    this.selectedShippingSheetDetailService.setShippingSheetDetail(null);
    this.router.navigate(['/app/shipping/shipping-sheet/sheet']);
  }
}
