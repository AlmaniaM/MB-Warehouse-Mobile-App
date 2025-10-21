import { 
  Component, 
  computed, 
  inject, 
  signal, 
  Signal, 
  WritableSignal,
  effect
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonModal, 
  IonProgressBar,
  IonText, 
  IonNote,
  IonCheckbox,
  IonButton, 
  IonButtons, 
  IonTitle,
  IonToolbar,
  IonHeader,
  IonChip
} from '@ionic/angular/standalone';

import { ShippingSheet, ShippingSheetService } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ShipSheetFormComponent } from 'src/app/modules/shipping/components/ship-sheet-form/ship-sheet-form.component';

@Component({
  selector: 'app-shipping-sheets',
  templateUrl: './shipping-sheets.page.html',
  styleUrls: ['./shipping-sheets.page.scss'],
  imports: [
    CommonModule,
    ScrollingModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem, 
    IonLabel,
    IonFab, 
    IonFabButton, 
    IonModal, 
    IonProgressBar,
    IonText, 
    IonNote,
    IonCheckbox,
    IonChip,
    PageTopbarComponent,
    ContentTopbarComponent,
    ShipSheetFormComponent
  ]
})
export class ShippingSheetsPage {
  
  router: Router = inject(Router);
  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);

  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetServiceStatus());
  });

  shippingSheets: Signal<ShippingSheet[]> = toSignal(this.shippingSheetService.shippingSheets, { initialValue: [] });
  isCreatingShippingSheet: WritableSignal<boolean> = signal(false);

  trackByShippingSheet(index: number, shippingSheet: ShippingSheet) { 
    return `${shippingSheet.shipmentNum}-${shippingSheet.shipmentYear}`;
  }

  setSelectedShippingSheet(shippingSheet: ShippingSheet) {
    this.selectedShippingSheetService.setShippingSheet(shippingSheet);
    this.router.navigate(['/app/shipping/ship-sheet']); 
  }

}
