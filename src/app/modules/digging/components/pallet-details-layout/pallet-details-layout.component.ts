import { 
  Component, 
  computed, 
  inject, 
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterEvent, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  IonIcon,
  IonTab,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel
} from '@ionic/angular/standalone';

import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { Pallet } from 'src/app/modules/digging/services/pallet.service';

@Component({
  selector: 'app-pallet-details-layout',
  templateUrl: './pallet-details-layout.component.html',
  styleUrls: ['./pallet-details-layout.component.scss'],
  imports: [
    RouterModule,
    IonIcon,
    IonTab,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel
  ]
})
export class PalletDetailsLayoutComponent {
  
  router: Router = inject(Router);
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);

  routerNavigationEvent: Signal<RouterEvent | null> = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)), 
    { initialValue: null }
  );

  selectedPallet: Signal<Pallet | null> = toSignal(this.selectedPalletService.selectedPallet$, { initialValue: null });

  isInContentPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/pallet/content') && !url.includes('/pallet/contents');
  });
  
  goBack() {
    this.selectedPalletService.setPallet(null);
    this.router.navigate(['/app/digging/pallets']);
  }
}
