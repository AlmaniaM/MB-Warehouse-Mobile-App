import { 
  Component,
  inject, 
  Signal,
  computed,
  signal,
  WritableSignal,
  effect
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
  IonChip,
  IonFab,
  IonFabButton,
  IonModal,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons
} from '@ionic/angular/standalone';

import { Pallet } from 'src/app/modules/digging/services/pallet.service';
import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { SelectedPalletContentsService } from '../../services/selected-pallet-contents.service';
import { PalletContentsDisplay, PalletContentsService, PalletContent } from '../../services/pallet-contents.service';
import { Router } from '@angular/router';
import { PalletContentsFormComponent } from '../../components/pallet-contents-form/pallet-contents-form.component';

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
    IonFab,
    IonFabButton,
    IonModal,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    PageTopbarComponent,
    ContentTopbarComponent,
    PalletContentsFormComponent
  ]
})
export class PalletContentsPage {
  
  router: Router = inject(Router);
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);
  selectedPalletContentsService: SelectedPalletContentsService = inject(SelectedPalletContentsService);
  selectedPalletContentService: SelectedPalletContentsService = inject(SelectedPalletContentsService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);
  
  selectedPallet: Signal<Pallet | null> = toSignal(this.selectedPalletService.selectedPallet$, { initialValue: null });
  palletContents: Signal<PalletContentsDisplay[] | null> = this.selectedPalletContentsService.selectedPalletContentsDisplay;
  isCreatingPalletContent: WritableSignal<boolean> = signal<boolean>(false);
  justCreatedPalletContent: Signal<PalletContent[]> = toSignal(this.palletContentsService.justCreatedPalletContents, { initialValue: [] });
  justCreatedPalletContentEffect = effect(() => {
    if (this.justCreatedPalletContent().length === 0) { return; }

    this.isCreatingPalletContent.set(false);
    this.selectedPalletContentService.setPalletContent(this.justCreatedPalletContent()[0]);
    this.router.navigate(['/app/digging/pallet/content/details']);
  });

  onPalletContentFormSubmit() {
    this.isCreatingPalletContent.set(false);
    this.palletContentsService.getAllPalletContents();
  }

  trackByContent(index: number, content: PalletContentsDisplay) {
    return content.palletContentsKey;
  }

  setSelectedPalletContent(content: PalletContentsDisplay) {
    this.selectedPalletContentService.setPalletContent(content);
    this.router.navigate(['/app/digging/pallet/content/details']); 
  }

  allContentsReceived: Signal<boolean> = computed(() => {
    const contents = this.palletContents();
    if (!contents || contents.length === 0) {
      return false;
    }
    return contents.every(content => content.isReceivedWarehouse === true);
  });
  
}
