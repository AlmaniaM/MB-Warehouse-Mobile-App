import { 
  Component,
  inject, 
  Signal, 
  effect
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

import { Pallet } from 'src/app/modules/digging/services/pallet.service';
import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { PalletService } from 'src/app/modules/digging/services/pallet.service';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { PalletFormComponent } from 'src/app/modules/digging/components/pallet-form/pallet-form.component';

@Component({
  selector: 'app-pallet-details',
  templateUrl: './pallet-details.page.html',
  styleUrls: ['./pallet-details.page.scss'],
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    PageTopbarComponent,
    PalletFormComponent
  ]
})
export class PalletDetailsPage {
  
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);
  palletService: PalletService = inject(PalletService);
  router: Router = inject(Router);

  selectedPallet: Signal<Pallet | null> = this.selectedPalletService.selectedPallet;
  palletServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.palletService.previousDataOperationSubject, { requireSync: true });
  palletServicePreviousDataOperationEffect = effect(() => {
    if (this.palletServicePreviousDataOperation() === 'deleted') {
      this.selectedPalletService.setPallet(null);
      this.router.navigate(['/app/digging/pallets']);
    }
  });

  palletServicePreviousDataOperationUpdateEffect = effect(() => {
    if (this.palletServicePreviousDataOperation() !== 'updated') { return; }
    
    const currentPallet = this.selectedPallet();
    if (!currentPallet) { return; }
    
    const updatedPallet = this.palletService.receivedPalletsSubject.value.find(p => p.palletKey === currentPallet.palletKey);
    if (updatedPallet) {
      this.selectedPalletService.setPallet(updatedPallet);
    }
  });

  onPalletFormUpdate() {
    this.palletService.getAllReceivedPallets();
  }
}
