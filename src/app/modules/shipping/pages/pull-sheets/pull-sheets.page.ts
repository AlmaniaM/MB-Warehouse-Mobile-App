import { 
  Component, 
  computed, 
  inject, 
  signal, 
  Signal, 
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonModal, 
  IonProgressBar,
  IonText, 
  IonNote,
  IonCheckbox,
  IonButton, 
  IonButtons, 
  IonTitle,
  IonToolbar,
  IonHeader,
  IonChip
} from '@ionic/angular/standalone';

import { PullSheetMain, PullSheetMainService } from 'src/app/modules/shipping/services/pull-sheet-main.service';
import { SelectedPullSheetMainService } from 'src/app/modules/shipping/services/selected-pull-sheet-main.service';
import { CustomerService, Customer } from 'src/app/modules/sourcelists/services/customer.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { MemoizationService } from 'src/app/modules/global/services/memoize.service';

export interface PullSheetMainDisplay extends PullSheetMain {
  customerName?: string;
}

@Component({
  selector: 'app-pull-sheets',
  templateUrl: './pull-sheets.page.html',
  styleUrls: ['./pull-sheets.page.scss'],
  imports: [
    CommonModule,
    ScrollingModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem, 
    IonLabel,
    IonFab, 
    IonFabButton, 
    IonModal, 
    IonProgressBar,
    IonText, 
    IonNote,
    IonCheckbox,
    IonChip,
    PageTopbarComponent,
    ContentTopbarComponent,
  ]
})
export class PullSheetsPage {
  
  router: Router = inject(Router);
  pullSheetMainService: PullSheetMainService = inject(PullSheetMainService);
  selectedPullSheetMainService: SelectedPullSheetMainService = inject(SelectedPullSheetMainService);
  customerService: CustomerService = inject(CustomerService);
	private memoizationService: MemoizationService = new MemoizationService();

  pullSheetMainServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.pullSheetMainService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.pullSheetMainServiceStatus());
  });

  pullSheetMains: Signal<PullSheetMain[]> = toSignal(this.pullSheetMainService.pullSheetMains, { initialValue: [] });
  isCreatingPullSheetMain: WritableSignal<boolean> = signal(false);
  customersMap: Signal<Map<number, Customer>> = this.customerService.customersMap;

  pullSheetMainsDisplay: Signal<PullSheetMainDisplay[]> = this.memoizationService.computedMemo(
    () => {
      const pullSheets = this.pullSheetMains();
      const map = this.customersMap();
      
      if (!pullSheets || pullSheets.length === 0) {
        return [];
      }
      
      return pullSheets.map(pullSheet => {
        let customerName: string | undefined;
        
        if (pullSheet.customerId !== null && pullSheet.customerId !== undefined) {
          const customer = map.get(pullSheet.customerId);
          customerName = customer?.name || `Customer ID: ${pullSheet.customerId}`;
        } else {
          customerName = 'Unknown Customer';
        }
        
        return {
          ...pullSheet,
          customerName
        };
      });
    },
    [this.pullSheetMains, this.customersMap],
    { key: 'pullSheetMainsDisplay' }
  );

  trackByPullSheetMain(index: number, pullSheetMain: PullSheetMainDisplay) { 
    return pullSheetMain.id;
  }

  setSelectedPullSheetMain(pullSheetMain: PullSheetMainDisplay) {
    const basePullSheetMain: PullSheetMain = {
      id: pullSheetMain.id,
      pullSheetNumber: pullSheetMain.pullSheetNumber,
      customerId: pullSheetMain.customerId,
      pickupDate: pullSheetMain.pickupDate,
      specialInstructions: pullSheetMain.specialInstructions,
      versionNumber: pullSheetMain.versionNumber,
      orderFullyShipped: pullSheetMain.orderFullyShipped,
      deleted: pullSheetMain.deleted,
      autoTimestampInsert: pullSheetMain.autoTimestampInsert,
      isSubmitted: pullSheetMain.isSubmitted,
      autoTimestampUpdate: pullSheetMain.autoTimestampUpdate
    };
    
    this.selectedPullSheetMainService.setPullSheetMain(basePullSheetMain);
    this.router.navigate(['/app/shipping/pull-sheet']); 
  }

  onFormCancel() {
    this.isCreatingPullSheetMain.set(false);
  }

  onFormSubmit() {
    this.isCreatingPullSheetMain.set(false);
  }

}
