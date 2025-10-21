import { Component, inject, Signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { IonContent } from "@ionic/angular/standalone";

import { SelectedShipSheetDetailService } from '../../services/selected-ship-sheet-detail.service';
import { ShipSheetDetail, ShipSheetDetailService } from '../../services/ship-sheet-detail.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ShipSheetDetailFormComponent } from '../../components/ship-sheet-detail-form/ship-sheet-detail-form.component';

@Component({
  selector: 'app-ship-sheet-detail',
  templateUrl: './ship-sheet-detail.page.html',
  styleUrls: ['./ship-sheet-detail.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent,
    ShipSheetDetailFormComponent
  ]
})
export class ShipSheetDetailPage {

  router: Router = inject(Router);
  selectedShipSheetDetailService: SelectedShipSheetDetailService = inject(SelectedShipSheetDetailService);
  shipSheetDetailService: ShipSheetDetailService = inject(ShipSheetDetailService);
  selectedShipSheetDetail: Signal<ShipSheetDetail | null> = this.selectedShipSheetDetailService.selectedShipSheetDetail;
  shipSheetDetailServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.shipSheetDetailService.previousDataOperationSubject, { requireSync: true });
  shipSheetDetailServicePreviousDataOperationEffect = effect(() => {
    if (this.shipSheetDetailServicePreviousDataOperation() !== 'deleted') { return; }
    this.selectedShipSheetDetailService.setShipSheetDetail(null);
    this.router.navigate(['/app/shipping/ship-sheet/sheet']);
  });

  shipSheetDetailServicePreviousDataOperationUpdateEffect = effect(() => {
    if (this.shipSheetDetailServicePreviousDataOperation() !== 'updated') { return; }
    
    const updatedShipSheetDetail = this.shipSheetDetailService.shipSheetDetailsSubject.value.find(detail => detail.id === this.selectedShipSheetDetail()?.id);
    if (updatedShipSheetDetail) {
      this.selectedShipSheetDetailService.setShipSheetDetail(updatedShipSheetDetail);
    }
  });

  onShipSheetDetailFormUpdate() {
    this.shipSheetDetailService.getAllShipSheetDetails();
  }

  onShipSheetDetailFormDelete() {
    this.shipSheetDetailService.getAllShipSheetDetails();
  }

}
