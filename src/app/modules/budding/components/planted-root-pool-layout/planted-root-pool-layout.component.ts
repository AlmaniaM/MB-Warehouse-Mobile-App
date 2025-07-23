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

import { PlantedRootPool } from '../../services/planted-root-pool.service';
import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';

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
  selectedPlantedRootPoolService:  SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);
  selectedPlantedRootPool: Signal<PlantedRootPool | null> = toSignal(this.selectedPlantedRootPoolService.selectedPlantedRootPool, { initialValue: null });

  goBack() {
    this.selectedPlantedRootPoolService.setPlantedRootPool(null);
    this.router.navigate(['/app/budding/planted-root-pools']);
  }
}
