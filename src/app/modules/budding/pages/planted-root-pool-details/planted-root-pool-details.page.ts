import { Component, inject, Signal } from '@angular/core';

import { IonContent } from "@ionic/angular/standalone";

import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';
import { PlantedRootPool } from '../../services/planted-root-pool.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PlantedRootPoolFormComponent } from '../../components/planted-root-pool-form/planted-root-pool-form.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-planted-root-pool-details',
  templateUrl: './planted-root-pool-details.page.html',
  styleUrls: ['./planted-root-pool-details.page.scss'],
    imports: [ 
      IonContent,
      ContentTopbarComponent,
      PageTopbarComponent,
      PlantedRootPoolFormComponent
    ]
})
export class PlantedRootPoolDetailsPage { 

  selectedPlantedRootPoolService: SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);
  selectedPlantedRootPool: Signal<PlantedRootPool | null> = toSignal(this.selectedPlantedRootPoolService.selectedPlantedRootPool, { initialValue: null });

}
