import { Component, output, signal, input, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline } from 'ionicons/icons';
import { ReturnReceiptFormComponent } from '../return-receipt-form/return-receipt-form.component';
import { ContainerReturnReceiptEntry } from '../../../../services/container-tracking/container-tracking.service';

@Component({
  selector: 'app-return-receipt-form-fab',
  templateUrl: './return-receipt-form-fab.component.html',
  styleUrls: ['./return-receipt-form-fab.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    ReturnReceiptFormComponent
  ]
})
export class ReturnReceiptFormFabComponent {
  readonly bottomMargin = input<string>('16px');
  readonly editReceipt = input<ContainerReturnReceiptEntry | null>(null);

  readonly receiptCreated = output<boolean>();
  readonly receiptUpdated = output<boolean>();
  readonly receiptDeleted = output<boolean>();

  readonly formComponent = viewChild<ReturnReceiptFormComponent>(ReturnReceiptFormComponent);

  readonly isFormOpen = signal<boolean>(false);

  constructor() {
    addIcons({
      'add-outline': addOutline,
      'close-outline': closeOutline
    });

    effect(() => {
      const editReceipt = this.editReceipt();
      if (editReceipt) {
        this.openForm();
        setTimeout(() => {
          const formComponent = this.formComponent();
          if (formComponent) {
            formComponent.loadReceiptForEditing(editReceipt);
          }
        }, 100);
      }
    });
  }

  readonly openForm = () => {
    this.isFormOpen.set(true);
  };

  readonly closeForm = () => {
    this.isFormOpen.set(false);
  };

  readonly onReceiptCreated = (success: boolean) => {
    this.closeForm();
    this.receiptCreated.emit(success);
  };

  readonly onReceiptUpdated = (success: boolean) => {
    this.closeForm();
    this.receiptUpdated.emit(success);
  };

  readonly onReceiptDeleted = (success: boolean) => {
    this.closeForm();
    this.receiptDeleted.emit(success);
  };
}
