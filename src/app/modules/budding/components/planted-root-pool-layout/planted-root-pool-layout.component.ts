import { 
  Component, 
  computed, 
  inject, 
  Signal 
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { PlantedRootPool } from '../../services/planted-root-pool.service';
import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';
import { BuddedRootPoolEntry } from '../../services/budded-root-pool-entry.service';
import { SelectedBuddingEntryService } from '../../services/selected-budding-entry.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-planted-root-pool-layout',
  templateUrl: './planted-root-pool-layout.component.html',
  styleUrls: ['./planted-root-pool-layout.component.scss'],
  imports: [
    IonTabButton, 
    IonIcon, 
    IonTabBar, 
    IonTabs 
  ]
})
export class PlantedRootPoolLayoutComponent {
  
  router: Router = inject(Router);
	routerNavigationEvent: Signal<RouterEvent | null> = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)), { initialValue: null });

  selectedPlantedRootPoolService:  SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);
  selectedBuddingEntryService: SelectedBuddingEntryService = inject(SelectedBuddingEntryService);
  
  selectedPlantedRootPool: Signal<PlantedRootPool | null> = toSignal(this.selectedPlantedRootPoolService.selectedPlantedRootPool, { initialValue: null });
  selectedBuddedRootPoolEntry: Signal<BuddedRootPoolEntry | null> = toSignal(this.selectedBuddingEntryService.selectedBuddedRootPoolEntry, { initialValue: null });

  isInBuddingEntryDetailsPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/budding-entry/details');
  });

  goBack() {
    this.selectedPlantedRootPoolService.setPlantedRootPool(null);
    this.router.navigate(['/app/budding/plantings']);
  }
}
