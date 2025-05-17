import { Component, output, signal } from '@angular/core';
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
import { LedgerEntryFormComponent } from '../ledger-entry-form/ledger-entry-form.component';

@Component({
  selector: 'app-ledger-entry-fab',
  templateUrl: './ledger-entry-fab.component.html',
  styleUrls: ['./ledger-entry-fab.component.scss'],
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
    LedgerEntryFormComponent
  ]
})
export class LedgerEntryFabComponent {
  readonly isCreateLedgerFormOpen = signal<boolean>(false);

  readonly entryCreated = output<boolean>();

  constructor() {
    addIcons({
      'add-outline': addOutline,
      'close-outline': closeOutline
    });
  }

  readonly openCreateLedgerForm = () => {
    this.isCreateLedgerFormOpen.set(true);
  };

  readonly closeCreateLedgerForm = () => {
    this.isCreateLedgerFormOpen.set(false);
  };

  readonly onLedgerFormSubmit = (success: boolean) => {
    this.closeCreateLedgerForm();
    this.entryCreated.emit(success);
  };
}
