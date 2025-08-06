import { 
  Component, 
  InputSignal, 
  OutputEmitterRef, 
  Signal, 
  WritableSignal, 
  computed, 
  inject, 
  input, 
  output, 
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonFooter,
  IonSearchbar,
  IonList,
  IonItem,
  IonCheckbox
} from '@ionic/angular/standalone';

import { Customer, CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-selector',
  templateUrl: './customer-selector.component.html',
  styleUrls: ['./customer-selector.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonFooter,
    IonSearchbar,
    IonList,
    IonItem,
    IonCheckbox
  ]
})
export class CustomerSelectorComponent {
  
  customerService: CustomerService = inject(CustomerService);
  customerServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Customer');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedCustomersChanged: OutputEmitterRef<Customer[]> = output<Customer[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  filteredCustomers: Signal<Customer[]> = computed(() => {
    if (this.customers().length === 0) { return []; }

    return this.customers()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(customer => customer.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedCustomers: WritableSignal<Customer[]> = signal<Customer[]>([]);
  selectedCustomerIds: Signal<number[]> = computed(() => {
    if (this.selectedCustomers().length === 0) { return []; }
    return this.selectedCustomers().map(customer => customer.id);
  });

  isChecked(customer: Customer): boolean {
    return this.selectedCustomerIds().includes(customer.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: Customer }>)  {

    const customer = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedCustomers.update(customers => [...customers, customer]);
      } else {
        this.selectedCustomers.set([customer]);
      }
    } else {
      this.selectedCustomers.update(customers => customers.filter(c => c.id !== customer.id));
    }
  }
}
