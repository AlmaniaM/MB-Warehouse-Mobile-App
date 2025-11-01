import { 
  Component,
  inject, 
  Signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonProgressBar,
} from '@ionic/angular/standalone';

import { PullSheetMain } from 'src/app/modules/shipping/services/pull-sheet-main.service';
import { SelectedPullSheetMainService } from 'src/app/modules/shipping/services/selected-pull-sheet-main.service';
import { ShippingSheetService, ShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { CustomerService, Customer } from 'src/app/modules/sourcelists/services/customer.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ShippingSheetsListComponent } from 'src/app/modules/shipping/components/shipping-sheets-list/shipping-sheets-list.component';

@Component({
  selector: 'app-pull-sheet-shipping-sheets',
  templateUrl: './pull-sheet-shipping-sheets.page.html',
  styleUrls: ['./pull-sheet-shipping-sheets.page.scss'],
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonProgressBar,
    PageTopbarComponent,
    ContentTopbarComponent,
    ShippingSheetsListComponent,
  ]
})
export class PullSheetShippingSheetsPage {
  
  router: Router = inject(Router);
  selectedPullSheetMainService: SelectedPullSheetMainService = inject(SelectedPullSheetMainService);
  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  customerService: CustomerService = inject(CustomerService);
  
  selectedPullSheetMain: Signal<PullSheetMain | null> = toSignal(
    this.selectedPullSheetMainService.selectedPullSheetMain$, 
    { initialValue: null }
  );
  
  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(
    this.shippingSheetService.statusSubject, 
    { requireSync: true }
  );

  isLoading: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetServiceStatus());
  });

  customers: Signal<Customer[] | null> = toSignal(this.customerService.customers, { initialValue: null });
  customer: Signal<Customer | null> = computed(() => {
    const selectedPullSheet = this.selectedPullSheetMain();
    const customerList = this.customers();
    if (!selectedPullSheet || !customerList) { return null; }
    return customerList.find(c => c.id === selectedPullSheet.customerId) || null;
  });

  pullSheetId: Signal<number | null> = computed(() => {
    const pullSheet = this.selectedPullSheetMain();
    return pullSheet ? pullSheet.id : null;
  });

  constructor() {
    this.shippingSheetService.getAllShippingSheets();
  }

  onShippingSheetClick(shippingSheet: ShippingSheet) {
    this.selectedShippingSheetService.setShippingSheet(shippingSheet);
    this.router.navigate(['/app/shipping/shipping-sheet']); 
  }
}

