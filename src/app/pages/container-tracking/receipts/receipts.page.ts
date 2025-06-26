import { Component, computed, effect, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular/standalone';

import { ContainerReturnReceiptEntry } from '../../../services/container-tracking/container-tracking.service';
import { ReturnReceiptService } from '../../../services/container-tracking/return-receipt.service';
import { ReturnReceiptFormFabComponent } from '../components/return-receipt-form-fab/return-receipt-form-fab.component';
import { ReturnReceiptTableComponent } from '../components/return-receipt-table/return-receipt-table.component';
import { ReceiptLedgerModalComponent } from '../components/receipt-ledger-modal/receipt-ledger-modal.component';
import { addIcons } from 'ionicons';
import { createOutline, listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.page.html',
  styleUrls: ['./receipts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    ReturnReceiptTableComponent,
    ReturnReceiptFormFabComponent
  ]
})
export class ReceiptsPage implements OnInit {
  private readonly returnReceiptService = inject(ReturnReceiptService);
  private readonly toastController = inject(ToastController);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly modalController = inject(ModalController);

  readonly returnReceipts = signal<ContainerReturnReceiptEntry[]>([]);
  readonly selectedReceipt = signal<ContainerReturnReceiptEntry | null>(null);
  readonly isLoading = computed(() => this.returnReceiptService.isFetchingReturnReceipts());

  constructor() {
    addIcons({
      'create-outline': createOutline,
      'list-outline': listOutline
    });

    effect(() => {
      const receipts = this.returnReceiptService.returnReceipts();
      this.returnReceipts.set(receipts);
    });
  }

  ngOnInit() {
    this.loadReturnReceipts();
  }

  loadReturnReceipts(force: boolean = false): void {
    this.returnReceiptService.getAllReturnReceipts();
  }

  refreshData(): void {
    this.loadReturnReceipts(true);
  }

  async onReceiptSelected(receipt: ContainerReturnReceiptEntry): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: `Receipt: ${receipt.containerReceiptReference || 'No Reference'}`,
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Edit Receipt',
          icon: 'create-outline',
          handler: () => {
            this.editReceipt(receipt);
          }
        },
        {
          text: 'View Ledger',
          icon: 'list-outline',
          handler: () => {
            this.viewReceiptLedger(receipt);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel-button'
        }
      ]
    });

    await actionSheet.present();
  }

  async onReturnReceiptCreated(success: boolean): Promise<void> {
    if (success) {
      this.loadReturnReceipts(true);

      const toast = await this.toastController.create({
        message: 'Return receipt created successfully',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async onReturnReceiptUpdated(success: boolean): Promise<void> {
    if (success) {
      this.loadReturnReceipts(true);

      const toast = await this.toastController.create({
        message: 'Return receipt updated successfully',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async onReturnReceiptDeleted(success: boolean): Promise<void> {
    if (success) {
      this.loadReturnReceipts(true);

      const toast = await this.toastController.create({
        message: 'Return receipt deleted successfully',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  private editReceipt(receipt: ContainerReturnReceiptEntry): void {
    this.selectedReceipt.set(receipt);
  }

  private async viewReceiptLedger(receipt: ContainerReturnReceiptEntry): Promise<void> {
    const modal = await this.modalController.create({
      component: ReceiptLedgerModalComponent,
      componentProps: {
        receipt: receipt
      },
      presentingElement: await this.modalController.getTop() || undefined
    });

    await modal.present();
  }
}
