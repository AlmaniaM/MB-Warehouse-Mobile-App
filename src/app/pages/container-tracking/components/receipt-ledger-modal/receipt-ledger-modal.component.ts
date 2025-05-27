import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSpinner,
  IonText,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

import { ContainerReturnReceiptEntry, ContainerTrackingService } from '../../../../services/container-tracking/container-tracking.service';
import { CustomerContainerLedgerTableComponent } from '../customer-container-ledger-table/customer-container-ledger-table.component';

@Component({
  selector: 'app-receipt-ledger-modal',
  templateUrl: './receipt-ledger-modal.component.html',
  styleUrls: ['./receipt-ledger-modal.component.scss'], standalone: true, imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonText,
    CustomerContainerLedgerTableComponent
  ]
})
export class ReceiptLedgerModalComponent implements OnInit {
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly modalController = inject(ModalController);

  receipt?: ContainerReturnReceiptEntry;

  readonly ledgerEntries = computed(() => this.containerTrackingService.receiptCustomerContainerLedgerEntries());
  readonly isLoading = computed(() => this.containerTrackingService.isFetchingReceiptCustomerContainerLedgers());

  constructor() {
    addIcons({
      'close': close
    });
  }

  ngOnInit() {
    if (this.receipt?.id) {
      this.containerTrackingService.getCustomerContainerLedgerEntriesByReturnReceiptId(this.receipt.id!.toString());
    }
  }

  async closeModal(): Promise<void> {
    await this.modalController.dismiss();
  }
}
