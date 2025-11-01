import { 
  Component, 
  inject, 
  Signal,
  effect
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  NavController
} from '@ionic/angular/standalone';

import { ShippingSheet, ShippingSheetService } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ShippingSheetFormComponent } from 'src/app/modules/shipping/components/shipping-sheet-form/shipping-sheet-form.component';

@Component({
  selector: 'app-shipping-sheet-details',
  templateUrl: './shipping-sheet-details.page.html',
  styleUrls: ['./shipping-sheet-details.page.scss'],
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    PageTopbarComponent,
    ContentTopbarComponent,
    ShippingSheetFormComponent
  ]
})
export class ShippingSheetDetailsPage {
  
  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  private navController: NavController = inject(NavController);
  
  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });

  shippingSheetServicePreviousDataOperationEffect = effect(() => {
    if (this.shippingSheetService.previousDataOperationSubject.value === 'deleted') {
      this.selectedShippingSheetService.setShippingSheet(null);
      this.navController.back();
    }
  });

  onShippingSheetFormUpdate() {
    this.shippingSheetService.getAllShippingSheets();
  }
}
