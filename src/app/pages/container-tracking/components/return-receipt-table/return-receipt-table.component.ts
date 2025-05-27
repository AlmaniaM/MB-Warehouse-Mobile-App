import { Component, computed, input, signal, viewChild, inject, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonItem,
  IonIcon
} from '@ionic/angular/standalone';
import { ContainerReturnReceiptEntry } from '../../../../services/container-tracking/container-tracking.service';
import { Customer, CustomerService } from '../../../../services/source-lists/customer.service';
import { addIcons } from 'ionicons';
import { receipt, person, calendar, filter as filterIcon } from 'ionicons/icons';
import { DropdownOption, DropdownSelectComponent } from '../../../../components/dropdown-select/dropdown-select.component';
import { ListViewComponent } from '../../../../components/list-view/list-view.component';

@Component({
  selector: 'app-return-receipt-table',
  templateUrl: './return-receipt-table.component.html',
  styleUrls: ['./return-receipt-table.component.scss'],
  standalone: true, imports: [
    CommonModule,
    DatePipe,
    IonItem,
    IonIcon,
    DropdownSelectComponent,
    ListViewComponent
  ]
})
export class ReturnReceiptTableComponent {
  private readonly customerService = inject(CustomerService);

  readonly returnReceipts = input<ContainerReturnReceiptEntry[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly disableFilters = input<boolean>(false);

  readonly receiptSelected = output<ContainerReturnReceiptEntry>();

  readonly listView = viewChild<ListViewComponent<ContainerReturnReceiptEntry>>(ListViewComponent);

  readonly selectedCustomers = signal<Customer[]>([]);
  readonly customerOptions = computed<DropdownOption<Customer>[]>(() => {
    const customers = this.customerService.customers() || [];
    return customers.map(customer => ({
      label: customer.name,
      value: customer
    }));
  });
  readonly filteredEntries = computed(() => {
    const entries = this.returnReceipts();
    const selectedCustomers = this.selectedCustomers();

    if (!selectedCustomers || selectedCustomers.length === 0) {
      return entries;
    }

    const selectedCustomerIds = selectedCustomers.map(customer => customer.id);
    return entries.filter(entry =>
      entry.customerId && selectedCustomerIds.includes(entry.customerId)
    );
  });
  readonly receiptCount = computed(() => this.filteredEntries().length);

  constructor() {
    addIcons({
      receipt,
      person,
      calendar,
      'filter': filterIcon
    });

    this.customerService.getCustomers();
  }

  onCustomerChange(value: Customer | Customer[] | null): void {
    this.selectedCustomers.set(Array.isArray(value) ? value : value ? [value] : []);
  }

  trackByReceiptId(index: number, receipt: ContainerReturnReceiptEntry): any {
    return receipt.id;
  }

  onReceiptClick(receipt: ContainerReturnReceiptEntry): void {
    this.receiptSelected.emit(receipt);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'No Date';
    return new Date(dateString).toLocaleDateString();
  }
}
