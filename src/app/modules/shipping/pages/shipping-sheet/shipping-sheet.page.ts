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
  IonSelectOption,
  IonProgressBar
} from '@ionic/angular/standalone';

import { ShippingSheet, ShippingSheetService } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { SelectedShippingSheetDetailService } from '../../services/selected-shipping-sheet-detail.service';
import { ShippingSheetDetailDisplay, ShippingSheetDetailService, ShippingSheetContent } from '../../services/shipping-sheet-detail.service';
import { Router } from '@angular/router';
import { ShippingSheetContentFormComponent } from '../../components/shipping-sheet-content-form/shipping-sheet-content-form.component';
import { PalletSelectorComponent } from 'src/app/modules/sourcelists/components/pallet-selector/pallet-selector.component';
import { ShippingSheetPhotoComponent } from '../../components/shipping-sheet-photo/shipping-sheet-photo.component';
import { PalletService, Pallet } from 'src/app/modules/sourcelists/services/pallet.service';
import { PalletContentsService } from 'src/app/modules/digging/services/pallet-contents.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-sheet',
  templateUrl: './shipping-sheet.page.html',
  styleUrls: ['./shipping-sheet.page.scss'],
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
    IonProgressBar,
    PageTopbarComponent,
    ContentTopbarComponent,
    ShippingSheetContentFormComponent,
    PalletSelectorComponent,
    ShippingSheetPhotoComponent,
  ]
})
export class ShippingSheetPage {
  
  router: Router = inject(Router);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  selectedShippingSheetDetailService: SelectedShippingSheetDetailService = inject(SelectedShippingSheetDetailService);
  shippingSheetDetailService: ShippingSheetDetailService = inject(ShippingSheetDetailService);
  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  palletService: PalletService = inject(PalletService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);
  
  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });
  shippingSheetDetails: Signal<ShippingSheetDetailDisplay[] | null> = this.selectedShippingSheetDetailService.selectedShippingSheetDetailsDisplay;
  isCreatingShippingSheetDetail: WritableSignal<boolean> = signal<boolean>(false);
  justCreatedShippingSheetDetail: Signal<ShippingSheetContent[]> = toSignal(this.shippingSheetDetailService.justCreatedShippingSheetDetails, { initialValue: [] });

  shippingSheetDetailServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetDetailService.statusSubject, { requireSync: true });
  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetService.statusSubject, { requireSync: true });

  isLoading: Signal<boolean> = computed(() => {
    const detailStatus = this.shippingSheetDetailServiceStatus();
    const sheetStatus = this.shippingSheetServiceStatus();
    
    return detailStatus === 'fetching' || 
           detailStatus === 'creating' ||
           detailStatus === 'updating' ||
           detailStatus === 'deleting' ||
           sheetStatus === 'fetching' ||
           sheetStatus === 'creating' ||
           sheetStatus === 'updating' ||
           sheetStatus === 'deleting';
  });

  palletServiceStatus: Signal<'error' | 'fetching' | 'stable' | 'creating' | 'updating' | 'deleting'> = toSignal(this.palletService.statusSubject, { requireSync: true });
  receivedPallets: Signal<Pallet[]> = toSignal(this.palletService.pallets, { initialValue: [] });
  isLoadingPallets: Signal<boolean> = computed(() => {
    return this.palletServiceStatus() === 'fetching' || 
           (this.isPalletSelectorOpen() && this.receivedPallets().length === 0);
  });
  
  addMode: WritableSignal<'pallet' | 'manual'> = signal<'pallet' | 'manual'>('pallet');
  isPalletSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  selectedPallets: WritableSignal<Pallet[]> = signal<Pallet[]>([]);
  isPhotoModalOpen: WritableSignal<boolean> = signal<boolean>(false);
  justCreatedShippingSheetDetailEffect = effect(() => {
    if (this.justCreatedShippingSheetDetail().length === 0) { return; }

    if (this.addMode() === 'manual') {
      this.isCreatingShippingSheetDetail.set(false);
      this.selectedShippingSheetDetailService.setShippingSheetDetail(this.justCreatedShippingSheetDetail()[0]);
      this.router.navigate(['/app/shipping/shipping-sheet/content/form']);
    }
  });

  allDetailsShipped: Signal<boolean> = computed(() => this.selectedShippingSheet()?.isShipped ?? false);

  onShippingSheetDetailFormSubmit() {
    this.isCreatingShippingSheetDetail.set(false);
    this.shippingSheetDetailService.getAllShippingSheetDetails();
  }

  openPalletSelector() {
    this.isPalletSelectorOpen.set(true);
  }

  onPalletsSelected(pallets: Pallet[]) {
    this.selectedPallets.set(pallets);
    this.isPalletSelectorOpen.set(false);
  }

  onPalletSelectionCancelled() {
    this.isPalletSelectorOpen.set(false);
  }

  onPhotoModalDismiss() {
    this.isPhotoModalOpen.set(false);
  }

  async saveAddedDetails() {
    if (this.addMode() === 'pallet') {
      await this.addDetailsFromPallets();
    } else {
      this.cancelAddDetails();
    }
  }

  async addDetailsFromPallets() {
    const pallets = this.selectedPallets();
    if (pallets.length === 0) { return; }

    const selectedSheet = this.selectedShippingSheet();
    if (!selectedSheet) { return; }

    const allPalletContents = this.palletContentsService.palletContentsSubject.value;

    for (const pallet of pallets) {
      const palletContents = allPalletContents.filter(pc => 
        pc.palletKey === pallet.palletKey && !pc.isDeleted
      );

      for (const content of palletContents) {
        const shippingSheetDetail: ShippingSheetContent = {
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
          sourceFieldId: content.fieldId,
          containerTypeId: null,
          palletNumber: pallet.palletNumber,
          note: content.note || null,
          previouslyShipped: 0,
          totalShipped: 0,
          deleted: false,
          autoTimestampInsert: null
        };

        this.shippingSheetDetailService.createShippingSheetDetail(shippingSheetDetail);
      }
    }

    this.shippingSheetDetailService.getShippingSheetDetailsByShipment(selectedSheet.shipmentNum, selectedSheet.shipmentYear);
    this.selectedPallets.set([]);
    this.isCreatingShippingSheetDetail.set(false);
    this.addMode.set('pallet');
  }

  cancelAddDetails() {
    this.selectedPallets.set([]);
    this.isCreatingShippingSheetDetail.set(false);
    this.addMode.set('pallet');
  }

  trackByDetail(index: number, detail: ShippingSheetDetailDisplay) {
    return `${detail.shipmentNum}-${detail.shipmentYear}-${detail.id}` || index;
  }

  setSelectedShippingSheetDetail(detail: ShippingSheetDetailDisplay) {
    this.selectedShippingSheetDetailService.setShippingSheetDetail(detail);
    this.router.navigate(['/app/shipping/shipping-sheet/content']); 
  }
 
}
