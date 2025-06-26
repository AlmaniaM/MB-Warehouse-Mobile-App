import { Component, OnInit, computed, effect, inject, output, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonTextarea,
  IonModal,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ContainerType, ContainerTypeService } from '../../../../services/inventory-tracking/container-type.service';
import { ContainerLedgerTransaction, ContainerTrackingService } from '../../../../services/container-tracking/container-tracking.service';
import { Customer, CustomerService } from 'src/app/services/source-lists/customer.service';
import { DropdownOption, DropdownSelectComponent } from '../../../../components/dropdown-select/dropdown-select.component';
import { FormActionButtonsComponent } from '../form-action-buttons/form-action-buttons.component';
import { ContainerTypeSelectComponent } from 'src/app/components/container-type-select/container-type-select.component';
import { CustomerSelectComponent } from 'src/app/components/customer-select/customer-select.component';

const MBN_NAME = `mike and brian's nursery`;

@Component({
  selector: 'app-ledger-entry-form',
  templateUrl: './ledger-entry-form.component.html',
  styleUrls: ['./ledger-entry-form.component.scss'], standalone: true, imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonDatetime,
    IonTextarea,
    IonModal,
    IonIcon,
    DropdownSelectComponent,
    FormActionButtonsComponent,
    ContainerTypeSelectComponent,
    CustomerSelectComponent
  ]
})
export class LedgerEntryFormComponent implements OnInit {
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly customerService = inject(CustomerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly formSubmitted = output<boolean>();

  readonly containerTypes = this.containerTypeService.containerTypes;
  readonly customers = this.customerService.customers;
  readonly selectedContainerType = signal<ContainerType[]>([]);
  readonly quantity = signal<number>(0);
  readonly date = signal<string>(new Date().toISOString());
  readonly note = signal<string>('');
  readonly fromType = signal<'MBN' | 'Customer'>('MBN');
  readonly toType = signal<'MBN' | 'Customer'>('Customer');
  readonly selectedCustomer = signal<Customer[]>([]);
  readonly fromCustomer = signal<Customer | null>(null);
  readonly toCustomer = signal<Customer | null>(null);
  readonly customerInvoiceNumber = signal<string>('');
  readonly customerRanch = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isDatePickerOpen = signal<boolean>(false);
  readonly formValid = signal<boolean>(false);
  readonly fromTypeOptions = signal<DropdownOption<'MBN' | 'Customer'>[]>([
    { label: 'MBN', value: 'MBN' },
    { label: 'Customer', value: 'Customer' }
  ]);
  readonly toTypeOptions = signal<DropdownOption<'MBN' | 'Customer'>[]>([
    { label: 'MBN', value: 'MBN' },
    { label: 'Customer', value: 'Customer' }
  ]);
  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    return (this.containerTypes() || []).map(type => ({
      label: type.name,
      value: type
    }));
  });
  readonly customerOptions = computed<DropdownOption<any>[]>(() => {
    return (this.customers() || []).map(customer => ({
      label: customer.name,
      value: customer
    }));
  });
  private mbnCustomer = signal<Customer | null>(null);

  // Effect to auto-set fromCustomer when fromType changes to 'Customer'
  // Also implement toggle behavior: if fromType changes, automatically set toType to the opposite value
  fromTypeEffect = effect(async () => {
    const currentFromType = this.fromType();

    // Set fromCustomer based on type
    if (currentFromType === 'Customer' && this.selectedCustomer().length > 0) {
      this.fromCustomer.set(this.selectedCustomer()[0]);
    } else if (currentFromType === 'MBN') {
      if (!this.mbnCustomer()) {
        this.fromCustomer.set(null);
      } else {
        this.fromCustomer.set(this.mbnCustomer());
      }
    }

    // Implement toggle behavior - set toType to the opposite value
    if (currentFromType === 'Customer') {
      this.toType.set('MBN');
    } else if (currentFromType === 'MBN') {
      this.toType.set('Customer');
    }
  }, { allowSignalWrites: true });

  // Effect to auto-set toCustomer when toType changes to 'Customer'
  // Also implement toggle behavior: if toType changes, automatically set fromType to the opposite value
  toTypeEffect = effect(async () => {
    const currentToType = this.toType();

    // Set toCustomer based on type
    if (currentToType === 'Customer' && this.selectedCustomer().length > 0) {
      this.toCustomer.set(this.selectedCustomer()[0]);
    } else if (currentToType === 'MBN') {
      if (!this.mbnCustomer()) {
        this.toCustomer.set(null);
      } else {
        this.toCustomer.set(this.mbnCustomer());
      }
    }

    // Implement toggle behavior - set fromType to the opposite value
    if (currentToType === 'Customer') {
      this.fromType.set('MBN');
    } else if (currentToType === 'MBN') {
      this.fromType.set('Customer');
    }
  }, { allowSignalWrites: true });

  // Effect to update the appropriate customer field when selectedCustomer changes
  selectedCustomerEffect = effect(() => {
    const customer = this.selectedCustomer();
    if (customer.length > 0) {
      if (this.fromType() === 'Customer') {
        this.fromCustomer.set(customer[0]);
      }
      if (this.toType() === 'Customer') {
        this.toCustomer.set(customer[0]);
      }
    }
  }, { allowSignalWrites: true });
  // Effect to handle MBN customer detection from the customer list
  mbnCustomerDetectionEffect = effect(() => {
    const customers = this.customers();
    if (customers && customers.length > 0) {
      const mbnCustomer = customers.find(customer => customer.name.toLowerCase() === MBN_NAME) || null;
      this.mbnCustomer.set(mbnCustomer);
    }
  }, { allowSignalWrites: true });

  // Effect to handle MBN customer updates
  mbnCustomerEffect = effect(() => {
    const customer = this.mbnCustomer();
    if (customer) {
      if (this.fromType() === 'MBN') {
        this.fromCustomer.set(customer);
      } else {
        this.fromCustomer.set(null);
      }
      if (this.toType() === 'MBN') {
        this.toCustomer.set(customer);
      } else {
        this.toCustomer.set(null);
      }
    }
  }, { allowSignalWrites: true });

  constructor() {
    addIcons({
      'calendar-outline': calendarOutline
    });

    effect(() => this.validateForm());
  }
  ngOnInit(): void {
    this.containerTypeService.getContainerTypes();
    this.customerService.getCustomers();
    this.resetForm();
  }

  onDateSelected(event: any): void {
    this.date.set(event.detail.value);
    this.isDatePickerOpen.set(false);
    this.validateForm();
  }

  submitForm(): void {
    if (!this.formValid()) return;

    this.isLoading.set(true);

    const transaction: ContainerLedgerTransaction = {
      id: 0,
      containerTypeId: this.selectedContainerType()![0]?.id || null,
      quantity: this.quantity(),
      date: this.date(),
      fromType: this.fromType(),
      from: this.fromCustomer()?.id || null,
      toType: this.toType(),
      to: this.toCustomer()?.id || null,
      note: this.note() || null,
      customerInvoiceNumber: this.customerInvoiceNumber() || null,
      customerRanch: this.customerRanch() || null
    };

    this.containerTrackingService.createContainerLedgerTransaction(transaction)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.resetForm();
          this.formSubmitted.emit(true);
        },
        error: (error) => {
          console.error('Error creating ledger entry:', error);
          this.isLoading.set(false);
          this.formSubmitted.emit(false);
        }
      });
  }
  resetForm(): void {
    this.selectedContainerType.set([]);
    this.quantity.set(0);
    this.date.set(new Date().toISOString());
    this.note.set('');
    this.fromType.set('MBN');
    this.toType.set('Customer');
    this.selectedCustomer.set([]);
    this.fromCustomer.set(null);
    this.toCustomer.set(null);
    this.customerInvoiceNumber.set('');
    this.customerRanch.set('');
    this.validateForm();
  }

  setQuantity(quantity: any): void {
    const parsedQuantity = parseFloat(quantity);
    if (!isNaN(parsedQuantity)) {
      this.quantity.set(parsedQuantity);
    } else {
      this.quantity.set(0);
    }
  }

  setCustomerInvoiceNumber(invoiceNumber: any): void {
    this.customerInvoiceNumber.set(invoiceNumber);
  }

  validateForm(): void {
    const containerType = this.selectedContainerType();
    const quantity = this.quantity();
    const date = this.date();
    const fromCustomer = this.fromCustomer();
    const toCustomer = this.toCustomer();

    const isValid =
      containerType.length > 0 &&
      quantity !== 0 &&
      !!date &&
      (fromCustomer !== null || this.fromType() === 'MBN') &&
      (toCustomer !== null || this.toType() === 'MBN');

    this.formValid.set(isValid);
  }
}
