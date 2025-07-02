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
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonIcon, 
  IonButtons, 
  IonHeader, 
  IonModal, 
  IonContent, 
  IonFooter, 
  IonText, 
  IonFab, 
  IonFabButton,
  IonProgressBar, IonLabel, IonDatetimeButton, IonPopover, IonDatetime } from '@ionic/angular/standalone';
import { Utils } from 'src/app/classes/utils';

import { 
  ContainerLedgerEntryService, 
  ContainerLedgerEntry, 
  ContainerLedgerTransaction, 
  defaultContainerLedgerEntry, 
  defaultContainerLedgerTransaction, 
  CustomerContainerLedgerEntry
} from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerReturnReceipt, ContainerReturnReceiptService } from 'src/app/services/inventory-tracking/container-tracking/container-return-receipt.service';
import { ContainerType, ContainerTypeService } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';
import { Customer, CustomerService, defaultCustomer } from 'src/app/services/inventory-tracking/sourcelists/customer.service';

@Component({
  selector: 'app-container-ledger-entry-form',
  templateUrl: './container-ledger-entry-form.component.html',
  styleUrls: ['./container-ledger-entry-form.component.scss'],
  imports: [IonDatetime, IonPopover, IonDatetimeButton, IonLabel, 
    FormsModule,
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
    IonTextarea,
    IonText, 
    IonProgressBar, 
  ]
})
export class ContainerLedgerEntryFormComponent  {
  
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  containerReturnReceiptService: ContainerReturnReceiptService = inject(ContainerReturnReceiptService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);

  containerLedgerEntryServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.containerLedgerEntryService.status, { initialValue: 'stable' });
  containerReturnReceiptServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.containerReturnReceiptService.status, { initialValue: 'stable' });
  containerTypeServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.containerLedgerEntryService.status, { initialValue: 'stable' });
  customerServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.customerService.status, { initialValue: 'stable' });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating'].includes(this.containerLedgerEntryServiceStatus()) || 
      ['fetching', 'creating'].includes(this.containerTypeServiceStatus()) ||
      ['fetching', 'creating', 'updating', 'deleting'].includes(this.containerReturnReceiptServiceStatus()) ||
      ['fetching', 'creating'].includes(this.customerServiceStatus());
  });

  containerReturnReceipts: Signal<ContainerReturnReceipt[]> = toSignal(this.containerReturnReceiptService.containerReturnReceipts, { initialValue: [] });
  containerTypes: Signal<ContainerType[]> = toSignal(this.containerTypeService.containerTypes, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  sortedContainerTypes: Signal<ContainerType[]> = computed(() => {
    return this.containerTypes().sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
  });

  sortedCustomers: Signal<Customer[]> = computed(() => {
    return this.customers().sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
  });

  inititalLedgerAction: InputSignal<'AddContainer' | 'RemoveContainer' | 'SendToCustomer' | 'RecieveFromCustomer'> = input.required<'AddContainer' | 'RemoveContainer' | 'SendToCustomer' | 'RecieveFromCustomer'>();
  formType: InputSignal<'new' | 'view'> = input.required<'new' | 'view'>();
  initialContainerLedgerEntry: InputSignal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = input.required<ContainerLedgerEntry | CustomerContainerLedgerEntry | null>();
  
  initalContainerLedgerEntryType: Signal<'Internal' | 'Customer' | 'None'> = computed(() => {
    if (!this.initialContainerLedgerEntry()) { return 'None'; }
    if ('customerId' in this.initialContainerLedgerEntry()!) { return 'Customer'; }
    return 'Internal';
  });

  initialContainerLedgerEntryEffect = effect(() => {
    if (this.containerReturnReceipts().length === 0) { return; }
    if (this.containerTypes().length === 0) { return; }
    if (this.customers().length === 0) { return; }

    this.ledgerAction.set(this.inititalLedgerAction());

    if (this.formType() === 'new') { 
      this.isEditing.set(true);      
      return; 
    }

    if (!this.initialContainerLedgerEntry()) { return; }

    this.containerType.set(this.containerTypes().find(containerType => containerType.id === this.initialContainerLedgerEntry()!.containerTypeId)!);
    this.quantity.set(this.initialContainerLedgerEntry()!.quantity);
    this.date.set(new Date(this.initialContainerLedgerEntry()!.date));
    this.note.set(this.initialContainerLedgerEntry()!.note);

    if (this.initalContainerLedgerEntryType() === 'Customer') { return; }

    this.customer.set(this.customers().find(customer => customer.id === (this.initialContainerLedgerEntry()! as CustomerContainerLedgerEntry).customerId)!);
    this.customerInvoiceNumber.set((this.initialContainerLedgerEntry()! as CustomerContainerLedgerEntry).customerInvoiceNumber);
    this.customerRanch.set((this.initialContainerLedgerEntry()! as CustomerContainerLedgerEntry).customerRanch);
    this.containerReturnReceipt.set(this.containerReturnReceipts().find(receipt => receipt.id === (this.initialContainerLedgerEntry()! as CustomerContainerLedgerEntry).containerReceiptId) || null);
    this.shipmentNumber.set((this.initialContainerLedgerEntry()! as CustomerContainerLedgerEntry).shipmentNum);
    this.shipmentYear.set((this.initialContainerLedgerEntry()! as CustomerContainerLedgerEntry).shipmentYear);
  });

  ledgerAction: WritableSignal<'AddContainer' | 'RemoveContainer' | 'SendToCustomer' | 'RecieveFromCustomer'> = signal<'AddContainer' | 'RemoveContainer' | 'SendToCustomer' | 'RecieveFromCustomer'>('SendToCustomer');
  ledgerActionEffect = effect(() => { 
    if (this.formType() === 'view') { return; }

    if (this.ledgerAction() === 'AddContainer') {
      this.fromType.set('MBN');
      this.toType.set(null);
      this.from.set(0);
      this.to.set(null);
    } 
    if (this.ledgerAction() === 'RemoveContainer') {
      this.fromType.set('MBN');
      this.toType.set(null);
      this.from.set(0);
      this.to.set(null);
    } 
    if (this.ledgerAction() === 'SendToCustomer') {
      this.fromType.set('MBN');
      this.toType.set('Customer');
      this.from.set(0);
      this.to.set(null);
    } 
    if (this.ledgerAction() === 'RecieveFromCustomer') {
      this.fromType.set('Customer');
      this.toType.set('MBN');
      this.from.set(0);
      this.to.set(0);
    }
  });

  containerType: WritableSignal<ContainerType | null> = signal<ContainerType | null>(null);
  quantity: WritableSignal<number> = signal<number>(0);
  date: WritableSignal<Date> = signal<Date>(new Date());
  dateIso: Signal<string> = computed<string>(() => this.date() ? Utils.adjustToLocalTime(this.date()!).toISOString() : '');
  customer: WritableSignal<Customer | null> = signal<Customer | null>(null);
  fromType: WritableSignal<'MBN' | 'Customer'> = signal<'MBN' | 'Customer'>('MBN');
  from: WritableSignal<number> = signal<number>(0);
  toType: WritableSignal<'MBN' | 'Customer' | null> = signal<'MBN' | 'Customer' | null>(null);
  to: WritableSignal<number | null> = signal<number | null>(null);
  note: WritableSignal<string | null> = signal<string | null>(null);
  customerInvoiceNumber: WritableSignal<string | null> = signal<string | null>(null);
  customerRanch: WritableSignal<string | null> = signal<string | null>(null);
  containerReturnReceipt: WritableSignal<ContainerReturnReceipt | null> = signal<ContainerReturnReceipt | null>(null);
  shipmentNumber: WritableSignal<string | null> = signal<string | null>(null);
  shipmentYear: WritableSignal<number | null> = signal<number | null>(null);
  
  dateChanged(event: CustomEvent) {
    this.date.set(new Date(event.detail.value!));
  }

  containerLedgerTransaction: Signal<ContainerLedgerTransaction> = computed(() => { 
    return {
      ...defaultContainerLedgerTransaction,
      containerTypeId: this.containerType() ? this.containerType()!.id : defaultContainerLedgerTransaction.containerTypeId,
      quantity: this.quantity(),
      date: this.date(),
      fromType: this.fromType(),
      from: this.customer() ? this.customer()!.id : defaultContainerLedgerTransaction.from,
      toType: this.toType(),
      to: this.customer() ? this.customer()!.id : defaultContainerLedgerTransaction.to,
      note: this.note(),
      customerInvoiceNumber: this.customerInvoiceNumber(),
      customerRanch: this.customerRanch(),
    };
  });  

  containerLedgerTransactionIsValid: Signal<boolean> = computed(() => { 
    if (!this.containerType()) { return false; }
    if (this.containerLedgerTransaction().containerTypeId === defaultContainerLedgerEntry.containerTypeId) { return false; }
    return true;
  });

  containerLedgerTransactionIsValidEffect = effect(() => { 
    if (this.formType() === 'view') { return; }
    if (!this.containerLedgerTransactionIsValid()) { return; }
    this.validContainerLedgerTransactionToCommit.set(this.containerLedgerTransaction());
  });

  validContainerLedgerTransactionToCommit: WritableSignal<ContainerLedgerTransaction | null> = signal<ContainerLedgerTransaction | null>(null);
  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  
  createContainerLedgerEntry() {
    if (!this.validContainerLedgerTransactionToCommit()) { return; }
    this.containerLedgerEntryService.commitContainerLedgerTransaction(this.validContainerLedgerTransactionToCommit()!);
    this.resetForm();
  }

  resetForm() { 
    this.containerType.set(null);
    this.quantity.set(0);
    this.date.set(new Date());
    this.customer.set(null);
    this.fromType.set('MBN');
    this.from.set(0);
    this.toType.set(null);
    this.to.set(null);
    this.note.set(null);
    this.customerInvoiceNumber.set(null);
    this.customerRanch.set(null);
    this.containerReturnReceipt.set(null);
    this.shipmentNumber.set(null);
    this.shipmentYear.set(null);
  }
}
