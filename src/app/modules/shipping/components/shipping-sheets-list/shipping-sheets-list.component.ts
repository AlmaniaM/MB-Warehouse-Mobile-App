import { 
  Component, 
  computed, 
  inject, 
  Signal, 
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  IonList,
  IonItem, 
  IonLabel, 
  IonProgressBar,
  IonText, 
  IonNote,
  IonChip
} from '@ionic/angular/standalone';

import { ShippingSheet, ShippingSheetService } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { MemoizationService } from 'src/app/modules/global/services/memoize.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';

export interface ShippingSheetDisplay extends ShippingSheet {
  customerName?: string;
}

@Component({
  selector: 'app-shipping-sheets-list',
  templateUrl: './shipping-sheets-list.component.html',
  styleUrls: ['./shipping-sheets-list.component.scss'],
  imports: [
    CommonModule,
    ScrollingModule,
    DatePipe,
    IonList,
    IonItem, 
    IonLabel,
    IonProgressBar,
    IonText, 
    IonNote,
    IonChip,
  ]
})
export class ShippingSheetsListComponent {
  
  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  private memoizationService: MemoizationService = new MemoizationService();
  private customerService: CustomerService = inject(CustomerService);
  
  shippingSheetsInput = input<ShippingSheet[] | undefined>(undefined);
  pullSheetId = input<number | null | undefined>(undefined);

  shippingSheetClick = output<ShippingSheet>();

  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(
    this.shippingSheetService.statusSubject, 
    { requireSync: true }
  );
  
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetServiceStatus());
  });

  private serviceShippingSheets: Signal<ShippingSheet[]> = toSignal(
    this.shippingSheetService.shippingSheets, 
    { initialValue: [] }
  );

  shippingSheets: Signal<ShippingSheet[]> = computed(() => {
    const inputSheets = this.shippingSheetsInput();
    const sheets = inputSheets !== undefined ? inputSheets : this.serviceShippingSheets();
    const filterPullSheetId = this.pullSheetId();
    
    if (filterPullSheetId !== undefined && filterPullSheetId !== null) {
      return sheets.filter(sheet => sheet.pullSheetId === filterPullSheetId);
    }
    
    if (filterPullSheetId === null) {
      return sheets.filter(sheet => sheet.pullSheetId === null);
    }
    
    return sheets;
  });
  
  customersMap: Signal<Map<number, Customer>> = this.customerService.customersMap;
  shippingSheetsDisplay: Signal<ShippingSheetDisplay[]> = this.memoizationService.computedMemo(
    () => {
      const shippingSheets = this.shippingSheets();
      const map = this.customersMap();
      return shippingSheets.map(shippingSheet => {
        return {
          ...shippingSheet,
          customerName: map.get(shippingSheet.customerId!)?.name || `Customer ID: ${shippingSheet.customerId}`
        };
      });
    },
    [this.shippingSheets, this.customersMap],
    { key: 'shippingSheetsDisplay' }
  );

  trackByShippingSheet(index: number, shippingSheet: ShippingSheet) { 
    return `${shippingSheet.shipmentNum}-${shippingSheet.shipmentYear}`;
  }

  onShippingSheetClick(shippingSheet: ShippingSheet) {
    this.shippingSheetClick.emit(shippingSheet);
  }

}

