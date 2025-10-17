import { 
  Component, 
  inject, 
  Signal 
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { SelectedPalletContentsService } from 'src/app/modules/digging/services/selected-pallet-contents.service';
import { PalletContent } from 'src/app/modules/digging/services/pallet-contents.service';

@Component({
  selector: 'app-pallet-content-details-layout',
  templateUrl: './pallet-content-details-layout.component.html',
  styleUrls: ['./pallet-content-details-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ]
})
export class PalletContentDetailsLayoutComponent  {
  
  router: Router = inject(Router);
  selectedPalletContentService: SelectedPalletContentsService = inject(SelectedPalletContentsService);

  selectedPalletContent: Signal<PalletContent | null> = this.selectedPalletContentService.selectedPalletContent;

  goBack() {
    this.selectedPalletContentService.setPalletContent(null);
    this.router.navigate(['/app/digging/pallet/contents']);
  }
}
