import { Component, inject, Signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { IonContent } from "@ionic/angular/standalone";

import { SelectedShippingSheetDetailService } from '../../services/selected-shipping-sheet-detail.service';
import { ShippingSheetContent, ShippingSheetDetailService } from '../../services/shipping-sheet-detail.service';
import { SelectedShippingSheetService } from '../../services/selected-shipping-sheet.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ShippingSheetContentFormComponent } from '../../components/shipping-sheet-content-form/shipping-sheet-content-form.component';

@Component({
  selector: 'app-shipping-sheet-content',
  templateUrl: './shipping-sheet-content.page.html',
  styleUrls: ['./shipping-sheet-content.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent,
    ShippingSheetContentFormComponent
  ]
})
export class ShippingSheetContentPage {

  router: Router = inject(Router);
  selectedShippingSheetDetailService: SelectedShippingSheetDetailService = inject(SelectedShippingSheetDetailService);
  shippingSheetDetailService: ShippingSheetDetailService = inject(ShippingSheetDetailService);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  selectedShippingSheetDetail: Signal<ShippingSheetContent | null> = this.selectedShippingSheetDetailService.selectedShippingSheetDetail;
  selectedShippingSheet: Signal<any> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });
  shippingSheetDetailServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.shippingSheetDetailService.previousDataOperationSubject, { requireSync: true });
  shippingSheetDetailServicePreviousDataOperationEffect = effect(() => {
    if (this.shippingSheetDetailServicePreviousDataOperation() !== 'deleted') { return; }
    
    this.shippingSheetDetailService.getAllShippingSheetDetails();
    this.selectedShippingSheetDetailService.setShippingSheetDetail(null);
    this.router.navigate(['/app/shipping/shipping-sheet/sheet']);
  });

  shippingSheetDetailServicePreviousDataOperationUpdateEffect = effect(() => {
    if (this.shippingSheetDetailServicePreviousDataOperation() !== 'updated') { return; }
    
    const updatedShippingSheetDetail = this.shippingSheetDetailService.shippingSheetDetailsSubject.value.find(detail => detail.id === this.selectedShippingSheetDetail()?.id);
    if (updatedShippingSheetDetail) {
      this.selectedShippingSheetDetailService.setShippingSheetDetail(updatedShippingSheetDetail);
    }
  });

  onShippingSheetDetailFormUpdate() {
    this.shippingSheetDetailService.getAllShippingSheetDetails();
  }

  onShippingSheetDetailFormDelete() {
    this.shippingSheetDetailService.getAllShippingSheetDetails();
  }

}
