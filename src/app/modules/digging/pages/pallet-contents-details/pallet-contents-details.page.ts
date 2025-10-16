import { Component, inject, Signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { IonContent } from "@ionic/angular/standalone";

import { SelectedPalletContentsService } from '../../services/selected-pallet-contents.service';
import { PalletContent, PalletContentsService } from '../../services/pallet-contents.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PalletContentsFormComponent } from '../../components/pallet-contents-form/pallet-contents-form.component';

@Component({
  selector: 'app-pallet-contents-details',
  templateUrl: './pallet-contents-details.page.html',
  styleUrls: ['./pallet-contents-details.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent,
    PalletContentsFormComponent
  ]
})
export class PalletContentsDetailsPage {

  router: Router = inject(Router);
  selectedPalletContentsService: SelectedPalletContentsService = inject(SelectedPalletContentsService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);
  selectedPalletContent: Signal<PalletContent | null> = this.selectedPalletContentsService.selectedPalletContent;
  palletContentsServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.palletContentsService.previousDataOperationSubject, { requireSync: true });
  palletContentsServicePreviousDataOperationEffect = effect(() => {
    if (this.palletContentsServicePreviousDataOperation() !== 'deleted') { return; }
    this.selectedPalletContentsService.setPalletContent(null);
    this.router.navigate(['/app/digging/pallet/contents']);
  });

  palletContentsServicePreviousDataOperationUpdateEffect = effect(() => {
    if (this.palletContentsServicePreviousDataOperation() !== 'updated') { return; }
    
    const updatedPalletContent = this.palletContentsService.palletContentsSubject.value.find(pc => pc.palletContentsKey === this.selectedPalletContent()?.palletContentsKey);
    if (updatedPalletContent) {
      this.selectedPalletContentsService.setPalletContent(updatedPalletContent);
    }
  });

  onPalletContentFormUpdate() {
    this.palletContentsService.getAllPalletContents();
  }

  onPalletContentFormDelete() {
    this.palletContentsService.getAllPalletContents();
  }

}
