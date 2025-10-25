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

import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { ShippingSheet, ShippingSheetService } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { ShippingSheetDetailService } from 'src/app/modules/shipping/services/shipping-sheet-detail.service';
import { VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSizeService } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { ContainerTypeService } from 'src/app/modules/sourcelists/services/container-type.service';
import { CustomerService } from 'src/app/modules/sourcelists/services/customer.service';
import { PalletService } from 'src/app/modules/sourcelists/services/pallet.service';

@Component({
  selector: 'app-manage-shipping-layout',
  templateUrl: './manage-shipping-layout.component.html',
  styleUrls: ['./manage-shipping-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon,
  ],
})
export class ManageShippingLayoutComponent {

  router: Router = inject(Router);
	routerNavigationEvent: Signal<RouterEvent | null> = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)), { initialValue: null });

  isInShippingSheetPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/shipping-sheet/');
  });

  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  shippingSheetDetailService: ShippingSheetDetailService = inject(ShippingSheetDetailService);
  varietyService: VarietyService = inject(VarietyService);
  rootstockService: RootstockService = inject(RootstockService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);
  palletService: PalletService = inject(PalletService);
  
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });
  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetServiceStatus());
  });


  navigateToShippingSheets() {
    this.router.navigate(['/app/shipping/manage/shipping-sheets']);
  }

  navigateToPullSheets() {
    this.router.navigate(['/app/shipping/manage/pull-sheets']);
  }

  setSelectedShippingSheet(shippingSheet: ShippingSheet) {
    this.selectedShippingSheetService.setShippingSheet(shippingSheet);
    this.router.navigate(['/app/shipping/shipping-sheet']); 
  }

  constructor() {
    this.shippingSheetService.getAllShippingSheets();
    this.shippingSheetDetailService.getAllShippingSheetDetails();
    this.varietyService.getVarieties();
    this.rootstockService.getRootstocks();
    this.plantedTypeService.getPlantedTypes();
    this.plantedFieldService.getPlantedFields();
    this.digTreeSizeService.getDigTreeSizes();
    this.containerTypeService.getContainerTypes();
    this.customerService.getCustomers();
    this.palletService.getPallets();
    
    if (this.selectedShippingSheet()) { 
      const currentUrl = this.router.url;
      if (!currentUrl.includes('/shipping-sheet')) {
        this.router.navigate(['/app/shipping/shipping-sheet']);
      }
    }
  }
}
