import { 
  Component,
  inject, 
  Signal,
  computed,
  signal,
  WritableSignal,
  effect
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCheckbox,
  IonNote,
  IonText,
  IonHeader,
  IonChip,
  IonFab,
  IonFabButton,
  IonModal,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

import { ShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { SelectedShipSheetDetailService } from '../../services/selected-ship-sheet-detail.service';
import { ShipSheetDetailDisplay, ShipSheetDetailService, ShipSheetDetail } from '../../services/ship-sheet-detail.service';
import { Router } from '@angular/router';
import { ShipSheetDetailFormComponent } from '../../components/ship-sheet-detail-form/ship-sheet-detail-form.component';
import { PalletSelectorComponent } from '../../components/pallet-selector/pallet-selector.component';
import { PalletService, ReceivedPallet } from 'src/app/modules/digging/services/pallet.service';
import { PalletContentsService, PalletContent } from 'src/app/modules/digging/services/pallet-contents.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ship-sheet',
  templateUrl: './ship-sheet.page.html',
  styleUrls: ['./ship-sheet.page.scss'],
  imports: [
    FormsModule,
    DatePipe,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCheckbox,
    IonNote,
    IonText,
    IonHeader,
    IonChip,
    IonFab,
    IonFabButton,
    IonModal,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonSelect,
    IonSelectOption,
    PageTopbarComponent,
    ContentTopbarComponent,
    ShipSheetDetailFormComponent,
    PalletSelectorComponent
  ]
})
export class ShipSheetPage {
  
  router: Router = inject(Router);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  selectedShipSheetDetailService: SelectedShipSheetDetailService = inject(SelectedShipSheetDetailService);
  shipSheetDetailService: ShipSheetDetailService = inject(ShipSheetDetailService);
  palletService: PalletService = inject(PalletService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);
  
  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });
  shipSheetDetails: Signal<ShipSheetDetailDisplay[] | null> = this.selectedShipSheetDetailService.selectedShipSheetDetailsDisplay;
  isCreatingShipSheetDetail: WritableSignal<boolean> = signal<boolean>(false);
  justCreatedShipSheetDetail: Signal<ShipSheetDetail[]> = toSignal(this.shipSheetDetailService.justCreatedShipSheetDetails, { initialValue: [] });
  
  // New signals for the enhanced modal
  addMode: WritableSignal<'pallet' | 'manual'> = signal<'pallet' | 'manual'>('pallet');
  isPalletSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  selectedPallets: WritableSignal<ReceivedPallet[]> = signal<ReceivedPallet[]>([]);
  justCreatedShipSheetDetailEffect = effect(() => {
    if (this.justCreatedShipSheetDetail().length === 0) { return; }

    this.isCreatingShipSheetDetail.set(false);
    this.selectedShipSheetDetailService.setShipSheetDetail(this.justCreatedShipSheetDetail()[0]);
    this.router.navigate(['/app/shipping/ship-sheet/detail/details']);
  });

  onShipSheetDetailFormSubmit() {
    this.isCreatingShipSheetDetail.set(false);
    this.shipSheetDetailService.getAllShipSheetDetails();
  }

  // New methods for enhanced modal functionality
  openPalletSelector() {
    this.isPalletSelectorOpen.set(true);
  }

  onPalletsSelected(pallets: ReceivedPallet[]) {
    this.selectedPallets.set(pallets);
    this.isPalletSelectorOpen.set(false);
  }

  onPalletSelectionCancelled() {
    this.isPalletSelectorOpen.set(false);
  }

  async saveAddedDetails() {
    if (this.addMode() === 'pallet') {
      await this.addDetailsFromPallets();
    } else {
      // Manual mode - form handles its own submission
      // Just close the modal
      this.cancelAddDetails();
    }
  }

  async addDetailsFromPallets() {
    const pallets = this.selectedPallets();
    if (pallets.length === 0) { return; }

    const selectedSheet = this.selectedShippingSheet();
    if (!selectedSheet) { return; }

    // Get all pallet contents
    const allPalletContents = this.palletContentsService.palletContentsSubject.value;

    // For each selected pallet, create ship sheet details from its contents
    for (const pallet of pallets) {
      const palletContents = allPalletContents.filter(pc => 
        pc.palletKey === pallet.palletKey && !pc.isDeleted
      );

      for (const content of palletContents) {
        const shipSheetDetail: ShipSheetDetail = {
          id: -1,
          entryDate: new Date(),
          varietyId: content.varietyId,
          rootstockId: content.rootstockId,
          digTreeSizeId: content.digTreeSizeId,
          plantedTypeId: content.plantedTypeId,
          quantity: content.quantity,
          shipmentNum: selectedSheet.shipmentNum,
          shipmentYear: selectedSheet.shipmentYear,
          ranch: null,
          contractEntryId: null,
          directSalesEntryId: null,
          fieldId: content.fieldId,
          containerTypeId: null,
          palletNumber: pallet.palletNumber,
          note: content.note || null,
          isShipped: false,
          previouslyShipped: null,
          totalShipped: null,
          deleted: false,
          autoTimestampInsert: null
        };

        this.shipSheetDetailService.createShipSheetDetail(shipSheetDetail);
      }
    }

    // Reset and close modal
    this.selectedPallets.set([]);
    this.isCreatingShipSheetDetail.set(false);
    this.addMode.set('pallet');
  }

  cancelAddDetails() {
    this.selectedPallets.set([]);
    this.isCreatingShipSheetDetail.set(false);
    this.addMode.set('pallet');
  }

  trackByDetail(index: number, detail: ShipSheetDetailDisplay) {
    return detail.id;
  }

  setSelectedShipSheetDetail(detail: ShipSheetDetailDisplay) {
    this.selectedShipSheetDetailService.setShipSheetDetail(detail);
    this.router.navigate(['/app/shipping/ship-sheet/detail/details']); 
  }

  allDetailsShipped: Signal<boolean> = computed(() => {
    const details = this.shipSheetDetails();
    if (!details || details.length === 0) {
      return false;
    }
    return details.every(detail => detail.isShipped === true);
  });
  
}
