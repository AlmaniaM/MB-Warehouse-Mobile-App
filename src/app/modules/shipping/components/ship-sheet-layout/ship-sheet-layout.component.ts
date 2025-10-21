import { 
  Component, 
  computed, 
  inject, 
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterEvent, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  IonIcon,
  IonTab,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel
} from '@ionic/angular/standalone';

import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { ShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { ShipSheetDetailService } from 'src/app/modules/shipping/services/ship-sheet-detail.service';
import { PalletService } from 'src/app/modules/digging/services/pallet.service';
import { PalletContentsService } from 'src/app/modules/digging/services/pallet-contents.service';

@Component({
  selector: 'app-ship-sheet-layout',
  templateUrl: './ship-sheet-layout.component.html',
  styleUrls: ['./ship-sheet-layout.component.scss'],
  imports: [
    RouterModule,
    IonIcon,
    IonTab,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel
  ]
})
export class ShipSheetLayoutComponent {
  
  router: Router = inject(Router);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  shipSheetDetailService: ShipSheetDetailService = inject(ShipSheetDetailService);
  palletService: PalletService = inject(PalletService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);

  routerNavigationEvent: Signal<RouterEvent | null> = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)), 
    { initialValue: null }
  );

  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });

  isInDetailPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/ship-sheet/detail');
  });
  
  goBack() {
    this.selectedShippingSheetService.setShippingSheet(null);
    this.router.navigate(['/app/shipping']);
  }

  constructor() {
    const selectedSheet = this.selectedShippingSheet();
    if (selectedSheet) {
      this.shipSheetDetailService.getShipSheetDetailsByShipment(selectedSheet.shipmentNum, selectedSheet.shipmentYear);
    }
    
    // Fetch pallet data for "Add From Pallet" functionality
    this.palletService.getAllReceivedPallets();
    this.palletContentsService.getAllPalletContents();
  }
}
