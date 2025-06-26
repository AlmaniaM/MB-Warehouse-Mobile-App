import { Component, computed, inject, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer, CustomerService } from '../../services/source-lists/customer.service';
import { DropdownOption, DropdownSelectComponent } from '../dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-customer-select',
  templateUrl: './customer-select.component.html',
  styleUrls: ['./customer-select.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DropdownSelectComponent
  ]
})
export class CustomerSelectComponent {
  private readonly customerService = inject(CustomerService);

  readonly label = input<string>('Container Type');
  readonly placeholder = input<string>('Select Container Type');
  readonly multiple = input<boolean>(false);
  readonly allowNullOption = input<boolean>(false);
  readonly enableSearch = input<boolean>(true);

  readonly selectedCustomers = model<Customer[]>([]);

  readonly selectionChange = output<Customer[]>();

  readonly isLoading = computed(() => this.customerService.status() === 'fetching');

  readonly customerOptions = computed<DropdownOption<Customer>[]>(() => {
    const customers = this.customerService.customers() || [];
    return customers
      .filter(customer => customer.active)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(customer => ({
        label: customer.name,
        value: customer
      }));
  });

  constructor() {
    this.customerService.getCustomers();
  }

  onSelectionChange(selection: Customer | Customer[] | null): void {
    if (selection) {
      const customers = Array.isArray(selection) ? selection : [selection];
      this.selectedCustomers.set(customers);
      this.selectionChange.emit(customers);
    } else {
      this.selectedCustomers.set([]);
      this.selectionChange.emit([]);
    }
  }
}
