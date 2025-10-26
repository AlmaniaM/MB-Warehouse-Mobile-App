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

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';

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

  pullSheetMainServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.pullSheetMainService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.pullSheetMainServiceStatus());
  });

  pullSheetMains: Signal<PullSheetMain[]> = toSignal(this.pullSheetMainService.pullSheetMains, { initialValue: [] });
  isCreatingPullSheetMain: WritableSignal<boolean> = signal(false);

  trackByPullSheetMain(index: number, pullSheetMain: PullSheetMain) { 
    return pullSheetMain.id;
  }

  setSelectedPullSheetMain(pullSheetMain: PullSheetMain) {
    this.selectedPullSheetMainService.setPullSheetMain(pullSheetMain);
    this.router.navigate(['/app/shipping/pull-sheet']); 
  }

  onFormCancel() {
    this.isCreatingPullSheetMain.set(false);
  }

  onFormSubmit() {
    this.isCreatingPullSheetMain.set(false);
  }

}
