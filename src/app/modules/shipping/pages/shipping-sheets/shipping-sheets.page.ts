import { 
  Component, 
  inject, 
  signal, 
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';

import { 
  IonContent,
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonModal, 
  IonButton, 
  IonButtons, 
  IonTitle,
  IonToolbar,
  IonHeader,
} from '@ionic/angular/standalone';

import { ShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ShippingSheetFormComponent } from 'src/app/modules/shipping/components/shipping-sheet-form/shipping-sheet-form.component';
import { ShippingSheetsListComponent } from 'src/app/modules/shipping/components/shipping-sheets-list/shipping-sheets-list.component';

@Component({
  selector: 'app-shipping-sheets',
  templateUrl: './shipping-sheets.page.html',
  styleUrls: ['./shipping-sheets.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFab, 
    IonFabButton, 
    IonModal, 
    PageTopbarComponent,
    ContentTopbarComponent,
    ShippingSheetFormComponent,
    ShippingSheetsListComponent,
  ]
})
export class ShippingSheetsPage {
  
  router: Router = inject(Router);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);

  isCreatingShippingSheet: WritableSignal<boolean> = signal(false);

  onShippingSheetClick(shippingSheet: ShippingSheet) {
    this.selectedShippingSheetService.setShippingSheet(shippingSheet);
    this.router.navigate(['/app/shipping/shipping-sheet']); 
  }

  onFormCancel() {
    this.isCreatingShippingSheet.set(false);
  }

  onFormSubmit() {
    this.isCreatingShippingSheet.set(false);
  }

}
