import { 
  Component,
  inject, 
  Signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonNote,
  IonText,
  IonChip,
  IonFab,
  IonFabButton,
  IonProgressBar,
  IonButton
} from '@ionic/angular/standalone';

import { PullSheetMain, PullSheetMainService } from 'src/app/modules/shipping/services/pull-sheet-main.service';
import { SelectedPullSheetMainService } from 'src/app/modules/shipping/services/selected-pull-sheet-main.service';
import { SelectedPullSheetDetailService } from 'src/app/modules/shipping/services/selected-pull-sheet-detail.service';
import { PullSheetDetailDisplay, PullSheetDetailService } from 'src/app/modules/shipping/services/pull-sheet-detail.service';
import { CustomerService } from 'src/app/modules/sourcelists/services/customer.service';
import { Customer } from 'src/app/modules/sourcelists/services/customer.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';

@Component({
  selector: 'app-pull-sheet-content',
  templateUrl: './pull-sheet-content.page.html',
  styleUrls: ['./pull-sheet-content.page.scss'],
  imports: [
    DatePipe,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonNote,
    IonText,
    IonChip,
    IonFab,
    IonFabButton,
    IonProgressBar,
    IonButton,
    PageTopbarComponent,
    ContentTopbarComponent,
  ]
})
export class PullSheetContentPage {
  
  router: Router = inject(Router);
  selectedPullSheetMainService: SelectedPullSheetMainService = inject(SelectedPullSheetMainService);
  selectedPullSheetDetailService: SelectedPullSheetDetailService = inject(SelectedPullSheetDetailService);
  pullSheetDetailService: PullSheetDetailService = inject(PullSheetDetailService);
  pullSheetMainService: PullSheetMainService = inject(PullSheetMainService);
  customerService: CustomerService = inject(CustomerService);
  
  selectedPullSheetMain: Signal<PullSheetMain | null> = toSignal(this.selectedPullSheetMainService.selectedPullSheetMain$, { initialValue: null });
  pullSheetDetails: Signal<PullSheetDetailDisplay[] | null> = this.selectedPullSheetDetailService.selectedPullSheetDetailsDisplay;
  
  pullSheetDetailServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.pullSheetDetailService.statusSubject, { requireSync: true });
  pullSheetMainServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.pullSheetMainService.statusSubject, { requireSync: true });

  isLoading: Signal<boolean> = computed(() => {
    const detailStatus = this.pullSheetDetailServiceStatus();
    const mainStatus = this.pullSheetMainServiceStatus();
    
    return detailStatus === 'fetching' || 
           detailStatus === 'creating' ||
           detailStatus === 'updating' ||
           detailStatus === 'deleting' ||
           mainStatus === 'fetching' ||
           mainStatus === 'creating' ||
           mainStatus === 'updating' ||
           mainStatus === 'deleting';
  });

  customers: Signal<Customer[] | null> = toSignal(this.customerService.customers, { initialValue: null });
  customer: Signal<Customer | null> = computed(() => {
    const selectedPullSheet = this.selectedPullSheetMain();
    const customerList = this.customers();
    if (!selectedPullSheet || !customerList) { return null; }
    return customerList.find(c => c.id === selectedPullSheet.customerId) || null;
  });

  orderedCount: Signal<number> = computed(() => {
    const details = this.pullSheetDetails();
    if (!details) { return 0; }
    return details.reduce((sum, detail) => sum + (detail.quantity || 0), 0);
  });

  shippedCount: Signal<number> = computed(() => {
    return 0;
  });

  remainingCount: Signal<number> = computed(() => {
    return this.orderedCount() - this.shippedCount();
  });

  trackByDetail(index: number, detail: PullSheetDetailDisplay) {
    return detail.id || index;
  }

  setSelectedPullSheetDetail(detail: PullSheetDetailDisplay) {
    this.selectedPullSheetDetailService.setPullSheetDetail(detail);
  }

  navigateToDetails() {
    this.router.navigate(['/app/shipping/pull-sheet/details']);
  }

  onViewShipSheets() {
    console.log('View Ship Sheets clicked');
  }
}
