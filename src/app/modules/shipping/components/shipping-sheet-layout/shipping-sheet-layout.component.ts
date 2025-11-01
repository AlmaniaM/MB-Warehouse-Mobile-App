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
  IonLabel,
  NavController
} from '@ionic/angular/standalone';

import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { ShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { ShippingSheetDetailService } from 'src/app/modules/shipping/services/shipping-sheet-detail.service';
import { PalletService } from 'src/app/modules/digging/services/pallet.service';
import { PalletContentsService } from 'src/app/modules/digging/services/pallet-contents.service';

@Component({
  selector: 'app-shipping-sheet-layout',
  templateUrl: './shipping-sheet-layout.component.html',
  styleUrls: ['./shipping-sheet-layout.component.scss'],
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
export class ShippingSheetLayoutComponent {
  
  router: Router = inject(Router);
  private navController: NavController = inject(NavController);
  
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  shippingSheetDetailService: ShippingSheetDetailService = inject(ShippingSheetDetailService);
  palletService: PalletService = inject(PalletService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);

  routerNavigationEvent: Signal<RouterEvent | null> = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)), 
    { initialValue: null }
  );

  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });

  isInShippingSheetPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/shipping-sheet/sheet') || url.includes('/shipping-sheet/detail');
  });
  
  goBack() {
    this.selectedShippingSheetService.setShippingSheet(null);
    
    // TODO: How do we want to handle back navigation when coming from a pull sheet details page?
    this.navController.back();
  }

  constructor() {
    const selectedSheet = this.selectedShippingSheet();
    if (selectedSheet) {
      this.shippingSheetDetailService.getShippingSheetDetailsByShipment(selectedSheet.shipmentNum, selectedSheet.shipmentYear);
    }
    
    this.palletService.getAllReceivedPallets();
    this.palletContentsService.getAllPalletContents();
  }
}
