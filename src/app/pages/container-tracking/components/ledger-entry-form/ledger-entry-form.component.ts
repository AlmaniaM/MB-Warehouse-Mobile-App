import { Component, OnInit, computed, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonDatetime,
  IonTextarea,
  IonSpinner,
  IonModal,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';

import { ContainerType, ContainerTypeService } from '../../../../services/inventory-tracking/container-type.service';
import { ContainerLedgerTransaction, ContainerTrackingService } from '../../../../services/container-tracking/container-tracking.service';
import { CustomerService } from 'src/app/services/source-lists/customer.service';
import { DropdownOption, DropdownSelectComponent } from '../../../../components/dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-ledger-entry-form',
  templateUrl: './ledger-entry-form.component.html',
  styleUrls: ['./ledger-entry-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonDatetime,
    IonTextarea,
    IonSpinner,
    IonModal,
    IonIcon,
    DropdownSelectComponent
  ]
})
export class LedgerEntryFormComponent implements OnInit {
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly customerService = inject(CustomerService);

  readonly formSubmitted = output<boolean>();

  readonly containerTypes = this.containerTypeService.containerTypes;
  readonly customers = this.customerService.customers;

  readonly selectedContainerType = signal<ContainerType | null>(null);
  readonly quantity = signal<number>(0);
  readonly date = signal<string>(new Date().toISOString());
  readonly note = signal<string>('');
  readonly fromType = signal<'MBN' | 'Customer'>('MBN');
  readonly toType = signal<'MBN' | 'Customer'>('Customer');
  readonly selectedCustomer = signal<any | null>(null);
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

  onFromTypeChange(): void {
    if (this.fromType() === 'MBN') {
      this.toType.set('Customer');
    } else {
      this.toType.set('MBN');
    }
    this.validateForm();
  }

  onToTypeChange(): void {
    if (this.toType() === 'MBN') {
      this.fromType.set('Customer');
    } else {
      this.fromType.set('MBN');
    }
    this.validateForm();
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
      containerTypeId: this.selectedContainerType()?.id || null,
      quantity: this.quantity(),
      date: this.date(),
      fromType: this.fromType(),
      from: this.fromType() === 'Customer' ? this.selectedCustomer()?.id : null,
      toType: this.toType(),
      to: this.toType() === 'Customer' ? this.selectedCustomer()?.id : null,
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
    this.selectedContainerType.set(null);
    this.quantity.set(0);
    this.date.set(new Date().toISOString());
    this.note.set('');
    this.fromType.set('MBN');
    this.toType.set('Customer');
    this.selectedCustomer.set(null);
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
    const isValid =
      !!this.selectedContainerType() &&
      this.quantity() !== 0 &&
      !!this.date() &&
      ((this.fromType() === 'Customer' || this.toType() === 'Customer') ? !!this.selectedCustomer() : true);

    this.formValid.set(isValid);
  }
}
