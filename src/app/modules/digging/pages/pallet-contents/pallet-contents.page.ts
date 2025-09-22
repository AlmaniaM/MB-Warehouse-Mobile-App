import { 
  Component,
  inject, 
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCheckbox,
  IonNote,
  IonText,
  IonHeader,
  IonChip
} from '@ionic/angular/standalone';

import { Pallet } from 'src/app/modules/digging/services/pallet.service';
import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { SelectedPalletContentsService } from '../../services/selected-pallet-contents.service';
import { PalletContentsDisplay } from '../../services/pallet-contents.service';

@Component({
  selector: 'app-pallet-contents',
  templateUrl: './pallet-contents.page.html',
  styleUrls: ['./pallet-contents.page.scss'],
  imports: [
    DatePipe,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCheckbox,
    IonNote,
    IonText,
    IonHeader,
    IonChip,
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class PalletContentsPage {
  
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);
  selectedPalletContentsService: SelectedPalletContentsService = inject(SelectedPalletContentsService);
  
  selectedPallet: Signal<Pallet | null> = toSignal(this.selectedPalletService.selectedPallet$, { initialValue: null });
  palletContents: Signal<PalletContentsDisplay[] | null> = this.selectedPalletContentsService.selectedPalletContentsDisplay;

  trackByContent(index: number, content: PalletContentsDisplay) {
    return content.palletContentsKey;
  }

  onContentReceivedChange(content: PalletContentsDisplay, isReceived: boolean) {
    console.log(content, isReceived);
  }
}
