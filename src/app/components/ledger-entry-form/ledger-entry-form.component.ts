import { Component, OnInit, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonTextarea,
  IonSpinner,
  IonModal,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';

import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { ContainerLedgerTransaction, ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { CustomerService } from 'src/app/services/source-lists/customer.service';

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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonDatetime,
    IonTextarea,
    IonSpinner,
    IonModal,
    IonIcon
  ]
})
export class LedgerEntryFormComponent implements OnInit {
  readonly formSubmitted = output<boolean>();

  // Services
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly customerService = inject(CustomerService);

  // Form fields
  readonly containerTypes = this.containerTypeService.containerTypes;
  readonly selectedContainerType = signal<ContainerType | null>(null);
  readonly quantity = signal<number>(0);
  readonly date = signal<string>(new Date().toISOString());
  readonly note = signal<string>('');
  readonly fromType = signal<'MBN' | 'Customer'>('MBN');
  readonly toType = signal<'MBN' | 'Customer'>('Customer');
  readonly customers = this.customerService.customers;
  readonly selectedCustomer = signal<any | null>(null);
  readonly customerInvoiceNumber = signal<string>('');
  readonly customerRanch = signal<string>('');

  // UI state
  readonly isLoading = signal<boolean>(false);
  readonly isDatePickerOpen = signal<boolean>(false);
  readonly formValid = signal<boolean>(false);

  constructor() {
    // Register icons
    addIcons({
      'calendar-outline': calendarOutline
    });

    // Validate form when inputs change
    effect(() => {
      this.validateForm();
    });
  }

  ngOnInit() {
    // Load container types
    this.containerTypeService.getContainerTypes();

    // Load customers
    this.customerService.getCustomers();

    // Initialize form with default values
    this.resetForm();
  }

  // Handle from/to type changes
  onFromTypeChange() {
    // If from type is MBN, to type should be Customer (and vice versa)
    if (this.fromType() === 'MBN') {
      this.toType.set('Customer');
    } else {
      this.toType.set('MBN');
    }
    this.validateForm();
  }

  onToTypeChange() {
    // If to type is MBN, from type should be Customer (and vice versa)
    if (this.toType() === 'MBN') {
      this.fromType.set('Customer');
    } else {
      this.fromType.set('MBN');
    }
    this.validateForm();
  }

  // Handle date selection
  onDateSelected(event: any) {
    this.date.set(event.detail.value);
    this.isDatePickerOpen.set(false);
    this.validateForm();
  }

  // Validate form
  validateForm() {
    const isValid =
      !!this.selectedContainerType() &&
      this.quantity() !== 0 &&
      !!this.date() &&
      ((this.fromType() === 'Customer' || this.toType() === 'Customer') ? !!this.selectedCustomer() : true);

    this.formValid.set(isValid);
  }

  // Submit the form
  submitForm() {
    if (!this.formValid()) return;

    this.isLoading.set(true);

    const transaction: ContainerLedgerTransaction = {
      id: 0, // API will assign ID
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

  // Reset the form to default values
  resetForm() {
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

  setQuantity(quantity: any) {
    const parsedQuantity = parseFloat(quantity);
    if (!isNaN(parsedQuantity)) {
      this.quantity.set(parsedQuantity);
    } else {
      this.quantity.set(0);
    }
  }

  setCustomerInvoiceNumber(invoiceNumber: any) {
    this.customerInvoiceNumber.set(invoiceNumber);
  }
}
