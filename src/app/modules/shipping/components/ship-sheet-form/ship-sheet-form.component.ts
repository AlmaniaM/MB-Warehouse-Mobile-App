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
  IonToggle,
  IonModal,
  IonContent,
  IonButton,
  IonButtons,
  IonText,
  IonFooter
} from '@ionic/angular/standalone';

import { ShippingSheet, ShippingSheetService, createDefaultShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { Utils } from 'src/app/modules/global/classes/utils';

@Component({
  selector: 'app-ship-sheet-form',
  templateUrl: './ship-sheet-form.component.html',
  styleUrls: ['./ship-sheet-form.component.scss'],
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
    IonToggle,
    IonModal,
    IonContent,
    IonButton,
    IonButtons,
    IonText,
    IonFooter
  ]
})
export class ShipSheetFormComponent  {
  
  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);

  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetServiceStatus());
  });

  formType: InputSignal<'new' | 'view' | 'update'> = input.required<'new' | 'view' | 'update'>();
  initialShippingSheet: InputSignal<ShippingSheet | null> = input.required<ShippingSheet | null>();
  
  initialShippingSheetEffect = effect(() => {
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

    if (!this.initialShippingSheet()) { return; }

    this.shipmentNum.set(this.initialShippingSheet()!.shipmentNum);
    this.shipmentYear.set(this.initialShippingSheet()!.shipmentYear);
    this.customerId.set(this.initialShippingSheet()!.customerId);
    this.shipmentDate.set(this.initialShippingSheet()!.shipmentDate ? new Date(this.initialShippingSheet()!.shipmentDate!) : new Date());
    this.pullSheetId.set(this.initialShippingSheet()!.pullSheetId);
    this.isShipped.set(this.initialShippingSheet()!.isShipped);
  });

  shipmentNum: WritableSignal<number> = signal<number>(0);
  shipmentYear: WritableSignal<string> = signal<string>(new Date().getFullYear().toString());
  customerId: WritableSignal<number | null> = signal<number | null>(null);
  shipmentDate: WritableSignal<Date> = signal<Date>(new Date());
  shipmentDateIso: Signal<string> = computed<string>(() => this.shipmentDate() ? Utils.toLocalIsoNoZ(this.shipmentDate()!) : '');
  pullSheetId: WritableSignal<number | null> = signal<number | null>(null);
  isShipped: WritableSignal<boolean> = signal<boolean>(false);

  shipmentDateChanged(event: CustomEvent) {
    const iso = event.detail.value!;
    this.shipmentDate.set(Utils.parseIonDateTimeLocal(iso));
  }

  updatedShippingSheetIsValid: Signal<boolean> = computed(() => { 
    if (this.shipmentNum() === null || this.shipmentNum() === undefined || this.shipmentNum() < 0) { 
      return false; 
    }
    if (!this.shipmentYear() || this.shipmentYear().length === 0) { 
      return false; 
    }
    if (!this.shipmentDate()) { 
      return false; 
    }
    return true;
  });

  formTitle: Signal<string> = computed(() => {
    const formType = this.formType();
    const isEditing = this.isEditing();
    
    switch (formType) {
      case 'new':
        return 'New Shipping Sheet';
      case 'view':
        return isEditing ? 'Edit Shipping Sheet' : 'View Shipping Sheet';
      case 'update':
        return 'Edit Shipping Sheet';
      default:
        return 'Shipping Sheet';
    }
  });

  updatedShippingSheet: Signal<ShippingSheet | null> = computed(() => {
    if (!this.updatedShippingSheetIsValid() || !this.initialShippingSheet()) { return null; }
    
    return {
      ...this.initialShippingSheet()!,
      shipmentNum: this.shipmentNum(),
      shipmentYear: this.shipmentYear(),
      customerId: this.customerId(),
      shipmentDate: this.shipmentDate(),
      pullSheetId: this.pullSheetId(),
      isShipped: this.isShipped()
    };
  });

  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isDeleting: WritableSignal<boolean> = signal<boolean>(false);

  formSubmit = output<void>();
  formUpdate = output<void>();
  formDelete = output<void>();
  
  private readonly defaultShippingSheet: ShippingSheet = createDefaultShippingSheet();
  
  createShippingSheet() {
    if (!this.updatedShippingSheetIsValid()) { return; }
    
    const shippingSheet: ShippingSheet = {
      ...this.defaultShippingSheet,
      shipmentNum: this.shipmentNum(),
      shipmentYear: this.shipmentYear(),
      customerId: this.customerId(),
      shipmentDate: this.shipmentDate(),
      pullSheetId: this.pullSheetId(),
      isShipped: this.isShipped()
    };
    
    this.shippingSheetService.createShippingSheet(shippingSheet);
    this.resetForm();
    this.formSubmit.emit();
  }

  resetForm() { 
    this.shipmentNum.set(0);
    this.shipmentYear.set(new Date().getFullYear().toString());
    this.customerId.set(null);
    this.shipmentDate.set(new Date());
    this.pullSheetId.set(null);
    this.isShipped.set(false);
  }

  updateShippingSheet() {
    if (!this.updatedShippingSheetIsValid()) { 
      return; 
    }
    
    const shippingSheet: ShippingSheet = {
      ...this.initialShippingSheet()!,
      shipmentNum: this.shipmentNum(),
      shipmentYear: this.shipmentYear(),
      customerId: this.customerId(),
      shipmentDate: this.shipmentDate(),
      pullSheetId: this.pullSheetId(),
      isShipped: this.isShipped()
    };
    
    this.shippingSheetService.updateShippingSheet(shippingSheet);
    this.isEditing.set(false);
    this.formUpdate.emit();
  }

  deleteShippingSheet() {
    if (!this.initialShippingSheet()) { return; }
    this.shippingSheetService.deleteShippingSheet(this.initialShippingSheet()!.shipmentNum, this.initialShippingSheet()!.shipmentYear);
    this.isDeleting.set(false);
    this.formDelete.emit();
  }
}
