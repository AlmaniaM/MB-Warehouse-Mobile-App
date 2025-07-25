import { 
  Component, 
  computed, 
  effect, 
  inject, 
  Signal, 
  InputSignal, 
  input, 
  signal,
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  IonFooter, 
  IonFab, 
  IonFabButton, 
  IonContent, 
  IonModal, 
  IonHeader, 
  IonButtons, 
  IonIcon, 
  IonButton,  
  IonToolbar, 
  IonTitle, 
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText, 
  IonProgressBar, 
  IonLabel, 
  IonDatetimeButton, 
  IonPopover, 
  IonDatetime 
} from '@ionic/angular/standalone';

import { ContainerReturnReceipt, ContainerReturnReceiptService, defaultContainerReturnReceipt } from 'src/app/modules/container-tracking/services/container-return-receipt.service';
import { Customer, CustomerService, defaultCustomer } from 'src/app/modules/sourcelists/services/customer.service';

import { Utils } from 'src/app/modules/global/classes/utils';
import { SelectedContainerReturnReceiptService } from 'src/app/modules/container-tracking/services/selected-container-return-receipt.service';

@Component({
  selector: 'app-container-return-receipt-form',
  templateUrl: './container-return-receipt-form.component.html',
  styleUrls: ['./container-return-receipt-form.component.scss'],
  imports: [
    FormsModule,
    IonDatetime, 
    IonPopover, 
    IonDatetimeButton, 
    IonLabel, 
    IonFooter, 
    IonFab, 
    IonFabButton, 
    IonContent, 
    IonModal, 
    IonHeader, 
    IonButtons, 
    IonIcon, 
    IonButton,  
    IonToolbar, 
    IonTitle, 
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonText, 
    IonProgressBar, 
  ]
})
export class ContainerReturnReceiptFormComponent {

  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  customerService: CustomerService = inject(CustomerService);

  containerReturnReceiptServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.containerReturnReceiptService.previousDataOperationSubject, { requireSync: true });
  containerReturnReceiptServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.containerReturnReceiptService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => { 
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.containerReturnReceiptServiceStatus()) || ['fetching'].includes(this.customerServiceStatus())
  });

  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  sortedCustomers: Signal<Customer[]> = computed(() => {
    return this.customers()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(variety => variety.active);
  });

  formType: InputSignal<'new' | 'update' | 'view'> = input.required<'new' | 'update' | 'view'>();
  initialContainerReturnReceipt: InputSignal<ContainerReturnReceipt | null> = input.required<ContainerReturnReceipt | null>();

  initialContainerReturnReceiptEffect = effect(() => {
    if (this.formType() === 'new') { 
      this.isEditing.set(true);      
      return; 
    }
    if (this.customers().length === 0) { return; }
    if (!this.initialContainerReturnReceipt()) { return; }
    
    this.containerReceiptReference.set(this.initialContainerReturnReceipt()!.containerReceiptReference);
    this.date.set(new Date(this.initialContainerReturnReceipt()!.date));
    this.customer.set(this.customers().find(customer => customer.id === this.initialContainerReturnReceipt()!.customerId)!);
  });

  containerReceiptReference: WritableSignal<string | null> = signal(null);
  date: WritableSignal<Date> = signal<Date>(new Date());
  dateIso: Signal<string> = computed<string>(() => this.date() ? Utils.adjustToLocalTime(this.date()!).toISOString() : '');
  customer: WritableSignal<Customer | null> = signal(null);

  dateChanged(event: CustomEvent) {
    this.date.set(new Date(event.detail.value!));
  }

  updatedContainerReturnReceipt: Signal<ContainerReturnReceipt> = computed(() => {
    return {
      ...this.formType() === 'new' ? defaultContainerReturnReceipt : this.initialContainerReturnReceipt()!,
      containerReceiptReference: this.containerReceiptReference(),
      date: this.date(),
      customerId: this.customer() ? this.customer()!.id : defaultCustomer.id
    }
  });

  updatedContainerReturnReceiptIsValid: Signal<boolean> = computed(() => { 
    if (!this.customer()) { return false; }
    if (this.containerReceiptReference() === '') { return false; }
    return true;
  });

  updatedContainerReturnReceiptIsValidEffect = effect(() => {
    if (this.formType() === 'view') { return; }
    if (!this.updatedContainerReturnReceiptIsValid()) { return; }
    this.validContainerReturnReceiptToSave.set(this.updatedContainerReturnReceipt());
  });

  validContainerReturnReceiptToSave: WritableSignal<ContainerReturnReceipt | null> = signal<ContainerReturnReceipt | null>(null);
  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isDeleting: WritableSignal<boolean> = signal<boolean>(false);

  createContainerReturnReceiptProduct() {
    if (!this.validContainerReturnReceiptToSave()) { return; }
    this.containerReturnReceiptService.createReturnReceipts([this.validContainerReturnReceiptToSave()!])
    this.resetForm();
  }

  updateContainerReturnReceiptProduct() {
    if (!this.validContainerReturnReceiptToSave()) { return; }
    this.containerReturnReceiptService.updateReturnReceipts([this.validContainerReturnReceiptToSave()!]);
  }

  deleteContainerReturnReceiptProduct() {
    if (!this.initialContainerReturnReceipt()) { return; }
    this.containerReturnReceiptService.deleteReturnReceipts([this.initialContainerReturnReceipt()!]);
  }

  justUpdatedEffect = effect(() => {
    if (this.containerReturnReceiptServicePreviousDataOperation() !== 'updated') { return; }
    this.selectedContainerReturnReceiptService.setContainerReturnReceipt(this.validContainerReturnReceiptToSave()!);
  });

  resetForm() {
    
    this.containerReceiptReference.set(null);
    this.date.set(new Date());
    this.customer.set(null);

    if (!this.initialContainerReturnReceipt()) { return; }

    this.containerReceiptReference.set(this.initialContainerReturnReceipt()!.containerReceiptReference);
    this.date.set(new Date(this.initialContainerReturnReceipt()!.date));
    this.customer.set(this.customers().find(customer => customer.id === this.initialContainerReturnReceipt()!.customerId)!);
  }

}
