import { 
  Component, 
  computed, 
  effect, 
  inject, 
  Signal, 
  InputSignal, 
  input, 
  signal,
  WritableSignal,
  output
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  IonList,
  IonItem,
  IonInput,
  IonTitle, 
  IonToolbar, 
  IonIcon, 
  IonHeader, 
  IonFab, 
  IonFabButton,
  IonProgressBar, 
  IonLabel, 
  IonDatetimeButton, 
  IonPopover, 
  IonDatetime,
  IonCheckbox,
  IonModal,
  IonContent,
  IonButton,
  IonButtons,
  IonText,
  IonFooter
} from '@ionic/angular/standalone';

import { Pallet, PalletService, createDefaultPallet } from 'src/app/modules/digging/services/pallet.service';
import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { Utils } from 'src/app/modules/global/classes/utils';

@Component({
  selector: 'app-pallet-form',
  templateUrl: './pallet-form.component.html',
  styleUrls: ['./pallet-form.component.scss'],
  imports: [
    FormsModule,
    IonDatetime, 
    IonPopover, 
    IonDatetimeButton, 
    IonLabel, 
    IonFab, 
    IonFabButton, 
    IonHeader, 
    IonIcon,  
    IonToolbar, 
    IonTitle, 
    IonList,
    IonItem,
    IonInput,
    IonProgressBar,
    IonCheckbox,
    IonModal,
    IonContent,
    IonButton,
    IonButtons,
    IonText,
    IonFooter
  ]
})
export class PalletFormComponent  {
  
  palletService: PalletService = inject(PalletService);

  palletServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.palletService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.palletServiceStatus());
  });

  formType: InputSignal<'new' | 'view' | 'update'> = input.required<'new' | 'view' | 'update'>();
  initialPallet: InputSignal<Pallet | null> = input.required<Pallet | null>();
  
  initialPalletEffect = effect(() => {
    if (this.formType() === 'new') { 
      this.isEditing.set(true);      
      return; 
    }

    if (this.formType() === 'update') { 
      this.isEditing.set(false);      
    }

    if (this.formType() === 'view') { 
      this.isEditing.set(false);      
    }

    if (!this.initialPallet()) { return; }

    this.palletNumber.set(this.initialPallet()!.palletNumber);
    this.digDate.set(new Date(this.initialPallet()!.digDate));
    this.deliveryYear.set(this.initialPallet()!.deliveryYear);
    this.archive.set(this.initialPallet()!.archive);
  });

  palletNumber: WritableSignal<number> = signal<number>(0);
  digDate: WritableSignal<Date> = signal<Date>(new Date());
  digDateIso: Signal<string> = computed<string>(() => this.digDate() ? Utils.toLocalIsoNoZ(this.digDate()!) : '');
  deliveryYear: WritableSignal<number> = signal<number>(new Date().getFullYear());
  archive: WritableSignal<boolean> = signal<boolean>(false);

  digDateChanged(event: CustomEvent) {
    const iso = event.detail.value!;
    this.digDate.set(Utils.parseIonDateTimeLocal(iso));
  }

  updatedPalletIsValid: Signal<boolean> = computed(() => { 
    if (this.palletNumber() === null || this.palletNumber() === undefined || this.palletNumber() < 0) { 
      return false; 
    }
    if (!this.digDate()) { 
      return false; 
    }
    if (!this.deliveryYear() || this.deliveryYear() < 2000) { 
      return false; 
    }
    return true;
  });

  formTitle: Signal<string> = computed(() => {
    const formType = this.formType();
    const isEditing = this.isEditing();
    
    switch (formType) {
      case 'new':
        return 'New Pallet';
      case 'view':
        return isEditing ? 'Edit Pallet' : 'View Pallet';
      case 'update':
        return 'Edit Pallet';
      default:
        return 'Pallet';
    }
  });

  updatedPallet: Signal<Pallet | null> = computed(() => {
    if (!this.updatedPalletIsValid() || !this.initialPallet()) { return null; }
    
    return {
      ...this.initialPallet()!,
      palletNumber: this.palletNumber(),
      digDate: this.digDate(),
      deliveryYear: this.deliveryYear(),
      archive: this.archive()
    };
  });

  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isDeleting: WritableSignal<boolean> = signal<boolean>(false);

  formSubmit = output<void>();
  formUpdate = output<void>();
  formDelete = output<void>();
  
  private readonly defaultPallet: Pallet = createDefaultPallet();
  
  createPallet() {
    if (!this.updatedPalletIsValid()) { return; }
    
    const pallet: Pallet = {
      ...this.defaultPallet,
      palletNumber: this.palletNumber(),
      digDate: this.digDate(),
      deliveryYear: this.deliveryYear(),
      archive: this.archive()
    };
    
    this.palletService.createPallet(pallet);
    this.resetForm();
    this.formSubmit.emit();
  }

  resetForm() { 
    this.palletNumber.set(0);
    this.digDate.set(new Date());
    this.deliveryYear.set(new Date().getFullYear());
    this.archive.set(false);
  }

  updatePallet() {
    if (!this.updatedPalletIsValid()) { 
      return; 
    }
    
    const pallet: Pallet = {
      ...this.initialPallet()!,
      palletNumber: this.palletNumber(),
      digDate: this.digDate(),
      deliveryYear: this.deliveryYear(),
      archive: this.archive()
    };
    
    this.palletService.updatePallet(pallet);
    this.isEditing.set(false);
    this.formUpdate.emit();
  }

  deletePallet() {
    if (!this.initialPallet()) { return; }
    this.palletService.deletePallet(this.initialPallet()!.palletKey);
    this.isDeleting.set(false);
    this.formDelete.emit();
  }
}
