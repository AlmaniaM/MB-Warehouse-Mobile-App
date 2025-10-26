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
  IonLabel,
  IonRouterOutlet
} from '@ionic/angular/standalone';

import { SelectedPullSheetMainService } from 'src/app/modules/shipping/services/selected-pull-sheet-main.service';
import { PullSheetMain } from 'src/app/modules/shipping/services/pull-sheet-main.service';
import { PullSheetDetailService } from 'src/app/modules/shipping/services/pull-sheet-detail.service';

@Component({
  selector: 'app-pull-sheet-layout',
  templateUrl: './pull-sheet-layout.component.html',
  styleUrls: ['./pull-sheet-layout.component.scss'],
  imports: [
    RouterModule,
    IonIcon,
    IonTab,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonRouterOutlet
  ]
})
export class PullSheetLayoutComponent {
  
  router: Router = inject(Router);
  selectedPullSheetMainService: SelectedPullSheetMainService = inject(SelectedPullSheetMainService);
  pullSheetDetailService: PullSheetDetailService = inject(PullSheetDetailService);

  routerNavigationEvent: Signal<RouterEvent | null> = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)), 
    { initialValue: null }
  );

  selectedPullSheetMain: Signal<PullSheetMain | null> = toSignal(this.selectedPullSheetMainService.selectedPullSheetMain$, { initialValue: null });

  isInPullSheetPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/pull-sheet/content') || url.includes('/pull-sheet/details');
  });
  
  goBack() {
    this.selectedPullSheetMainService.setPullSheetMain(null);
    this.router.navigate(['/app/shipping']);
  }

  constructor() {
    const selectedPullSheet = this.selectedPullSheetMain();
    if (selectedPullSheet) {
      this.pullSheetDetailService.getPullSheetDetailsForPullSheetMain(selectedPullSheet.id);
    }
  }
}
