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

import { SelectedShipSheetDetailService } from 'src/app/modules/shipping/services/selected-ship-sheet-detail.service';
import { ShipSheetDetail } from 'src/app/modules/shipping/services/ship-sheet-detail.service';

@Component({
  selector: 'app-ship-sheet-detail-layout',
  templateUrl: './ship-sheet-detail-layout.component.html',
  styleUrls: ['./ship-sheet-detail-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ]
})
export class ShipSheetDetailLayoutComponent  {
  
  router: Router = inject(Router);
  selectedShipSheetDetailService: SelectedShipSheetDetailService = inject(SelectedShipSheetDetailService);

  selectedShipSheetDetail: Signal<ShipSheetDetail | null> = this.selectedShipSheetDetailService.selectedShipSheetDetail;

  goBack() {
    this.selectedShipSheetDetailService.setShipSheetDetail(null);
    this.router.navigate(['/app/shipping/ship-sheet/sheet']);
  }
}
