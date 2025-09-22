import { 
  Component, 
  computed, 
  inject, 
  signal, 
  Signal, 
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
  IonHeader
} from '@ionic/angular/standalone';

import { Pallet, PalletService } from 'src/app/modules/digging/services/pallet.service';
import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PalletFormComponent } from 'src/app/modules/digging/components/pallet-form/pallet-form.component';

@Component({
  selector: 'app-pallets',
  templateUrl: './pallets.page.html',
  styleUrls: ['./pallets.page.scss'],
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
    PageTopbarComponent,
    ContentTopbarComponent,
    PalletFormComponent
  ]
})
export class PalletsPage {
  
  router: Router = inject(Router);
  palletService: PalletService = inject(PalletService);
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);

  palletServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.palletService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.palletServiceStatus());
  });

  pallets: Signal<Pallet[]> = toSignal(this.palletService.pallets, { initialValue: [] });
  isCreatingPallet: WritableSignal<boolean> = signal(false);

  constructor() {
    this.palletService.getAllPallets();
  }

  trackByPallet(index: number, pallet: Pallet) { 
    return pallet.palletKey;
  }

  setSelectedPallet(pallet: Pallet) {
    this.selectedPalletService.setPallet(pallet);
    this.router.navigate(['/app/digging/pallet']); 
  }

  toggleArchiveStatus(pallet: Pallet) {
    const updatedPallet = { ...pallet, archive: !pallet.archive };
    
    // Update through the service
    this.palletService.updatePallet(updatedPallet);
  }
}
