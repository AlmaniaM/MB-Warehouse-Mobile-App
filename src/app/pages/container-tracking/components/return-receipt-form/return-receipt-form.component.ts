import { Component, OnInit, computed, inject, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonSpinner,
  IonModal,
  IonIcon,
  IonContent,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, saveOutline, trashOutline, refreshOutline } from 'ionicons/icons';

import { ContainerReturnReceiptEntry } from '../../../../services/container-tracking/container-tracking.service';
import { ReturnReceiptService } from '../../../../services/container-tracking/return-receipt.service';
import { Customer, CustomerService } from '../../../../services/source-lists/customer.service';
import { DropdownOption, DropdownSelectComponent } from '../../../../components/dropdown-select/dropdown-select.component';
import { FormActionButtonsComponent } from '../form-action-buttons/form-action-buttons.component';

@Component({
  selector: 'app-return-receipt-form',
  templateUrl: './return-receipt-form.component.html',
  styleUrls: ['./return-receipt-form.component.scss'],
  standalone: true, imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonDatetime,
    IonSpinner,
    IonModal,
    IonIcon,
    IonContent,
    DropdownSelectComponent,
    FormActionButtonsComponent
  ]
})
export class ReturnReceiptFormComponent implements OnInit {
  private readonly returnReceiptService = inject(ReturnReceiptService);
  private readonly customerService = inject(CustomerService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly receiptCreated = output<boolean>();
  readonly receiptUpdated = output<boolean>();
  readonly receiptDeleted = output<boolean>();

  readonly customers = this.customerService.customers;
  readonly isLoading = signal<boolean>(false);
  readonly isDatePickerOpen = signal<boolean>(false);
  readonly selectedDate = signal<string>(new Date().toISOString());
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly selectedReceipt = signal<ContainerReturnReceiptEntry | null>(null);
  readonly customerOptions = computed<DropdownOption<Customer>[]>(() => {
    return this.customers().map(customer => ({
      label: customer.name,
      value: customer
    }));
  });
  readonly isFormValid = computed(() => {
    return this.containerReceiptReference().trim().length > 0 &&
      this.selectedDate() &&
      this.selectedCustomer() !== null;
  });
  readonly isEditMode = computed(() => this.selectedReceipt() !== null);
  readonly currentDate = computed(() => new Date().toISOString());

  readonly containerReceiptReference = model<string>('');

  constructor() {
    addIcons({
      'calendar-outline': calendarOutline,
      'save-outline': saveOutline,
      'trash-outline': trashOutline,
      'refresh-outline': refreshOutline
    });
  }

  // Lifecycle Hooks
  ngOnInit() {
    this.customerService.getCustomers();
  }

  onCustomerChange(customer: Customer | Customer[] | null): void {
    if (Array.isArray(customer)) {
      this.selectedCustomer.set(customer[0] || null);
    } else {
      this.selectedCustomer.set(customer);
    }
  }

  onDateChange(event: any): void {
    this.selectedDate.set(event.detail.value);
    this.closeDatePicker();
  }

  openDatePicker(): void {
    this.isDatePickerOpen.set(true);
  }

  closeDatePicker(): void {
    this.isDatePickerOpen.set(false);
  }

  resetForm(): void {
    this.containerReceiptReference.set('');
    this.selectedDate.set(new Date().toISOString());
    this.selectedCustomer.set(null);
    this.selectedReceipt.set(null);
  }

  loadReceiptForEditing(receipt: ContainerReturnReceiptEntry): void {
    this.selectedReceipt.set(receipt);
    this.containerReceiptReference.set(receipt.containerReceiptReference || '');
    this.selectedDate.set(receipt.date || new Date().toISOString());

    const customer = this.customers().find(c => c.id === receipt.customerId);
    this.selectedCustomer.set(customer || null);
  }

  async createReceipt(): Promise<void> {
    if (!this.isFormValid()) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    this.isLoading.set(true);

    const receiptData: ContainerReturnReceiptEntry = {
      containerReceiptReference: this.containerReceiptReference(),
      date: this.selectedDate(),
      customerId: this.selectedCustomer()!.id,
      customerName: this.selectedCustomer()!.name
    };

    this.returnReceiptService.createReturnReceipt(receiptData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.receiptCreated.emit(true);
        this.resetForm();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error creating receipt:', error);
        this.receiptCreated.emit(false);
        this.showToast('Failed to create receipt', 'danger');
      }
    });
  }

  async updateReceipt(): Promise<void> {
    if (!this.isFormValid() || !this.selectedReceipt()) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    this.isLoading.set(true);

    const receiptData: ContainerReturnReceiptEntry = {
      ...this.selectedReceipt()!,
      containerReceiptReference: this.containerReceiptReference(),
      date: this.selectedDate(),
      customerId: this.selectedCustomer()!.id,
      customerName: this.selectedCustomer()!.name
    };

    this.returnReceiptService.updateReturnReceipt(receiptData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.receiptUpdated.emit(true);
        this.resetForm();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error updating receipt:', error);
        this.receiptUpdated.emit(false);
        this.showToast('Failed to update receipt', 'danger');
      }
    });
  }

  async deleteReceipt(): Promise<void> {
    if (!this.selectedReceipt() || !this.selectedReceipt()!.id) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this return receipt?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.performDelete();
          }
        }
      ]
    });

    await alert.present();
  }

  private async performDelete(): Promise<void> {
    if (!this.selectedReceipt()?.id) return;

    this.isLoading.set(true);

    this.returnReceiptService.deleteReturnReceipt(this.selectedReceipt()!.id!).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.receiptDeleted.emit(true);
        this.resetForm();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error deleting receipt:', error);
        this.receiptDeleted.emit(false);
        this.showToast('Failed to delete receipt', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string = 'medium'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
