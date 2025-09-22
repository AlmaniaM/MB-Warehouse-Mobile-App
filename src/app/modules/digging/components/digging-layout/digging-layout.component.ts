import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { SelectedPalletContentsService } from 'src/app/modules/digging/services/selected-pallet-contents.service';
import { Pallet, PalletService } from 'src/app/modules/digging/services/pallet.service';
import { PalletContent, PalletContentsService } from 'src/app/modules/digging/services/pallet-contents.service';
import { VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';

@Component({
  selector: 'app-digging-layout',
  templateUrl: './digging-layout.component.html',
  styleUrls: ['./digging-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ],
})
export class DiggingLayoutComponent {

  router: Router = inject(Router);
	routerNavigationEvent: Signal<RouterEvent | null> = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)), { initialValue: null });

  isInPalletPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/pallet/');
  });

  isInReportPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/report/');
  });

  palletService: PalletService = inject(PalletService);
  palletContentsService: PalletContentsService = inject(PalletContentsService);
  varietyService: VarietyService = inject(VarietyService);
  rootstockService: RootstockService = inject(RootstockService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);
  selectedPallet: Signal<Pallet | null> = toSignal(this.selectedPalletService.selectedPallet$, { initialValue: null });

  selectedPalletContentsService: SelectedPalletContentsService = inject(SelectedPalletContentsService);
  selectedPalletContents: Signal<PalletContent[] | null> = this.selectedPalletContentsService.selectedPalletContents;

  constructor() {
    this.palletService.getAllPallets();
    this.palletContentsService.getAllPalletContents();
    this.varietyService.getVarieties();
    this.rootstockService.getRootstocks();
    this.plantedTypeService.getPlantedTypes();
    this.plantedFieldService.getPlantedFields();

    // Only navigate if we have a selected pallet and we're not already in a pallet-related route
    if (this.selectedPallet()) { 
      const currentUrl = this.router.url;
      if (!currentUrl.includes('/pallet')) {
        this.router.navigate(['/app/digging/pallet']);
      }
    }
  }
}
