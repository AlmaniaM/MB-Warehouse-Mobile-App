import { Component, computed, inject, Signal, signal, WritableSignal, effect } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { ShipSheetDetailService } from 'src/app/modules/shipping/services/ship-sheet-detail.service';
import { VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSizeService } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { ContainerTypeService } from 'src/app/modules/sourcelists/services/container-type.service';
import { CustomerService } from 'src/app/modules/sourcelists/services/customer.service';

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

  isInShipSheetPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/ship-sheet/');
  });

  shippingSheetService: ShippingSheetService = inject(ShippingSheetService);
  shipSheetDetailService: ShipSheetDetailService = inject(ShipSheetDetailService);
  varietyService: VarietyService = inject(VarietyService);
  rootstockService: RootstockService = inject(RootstockService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  customerService: CustomerService = inject(CustomerService);
  
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });
  shippingSheetServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetServiceStatus());
  });

  shippingSheets: Signal<ShippingSheet[]> = toSignal(this.shippingSheetService.shippingSheets, { initialValue: [] });
  isCreatingShippingSheet: WritableSignal<boolean> = signal(false);

  activeTab: WritableSignal<'shipping-sheets' | 'pull-sheets'> = signal<'shipping-sheets' | 'pull-sheets'>('shipping-sheets');

  isShippingSheetsActive: Signal<boolean> = computed(() => this.activeTab() === 'shipping-sheets');
  isPullSheetsActive: Signal<boolean> = computed(() => this.activeTab() === 'pull-sheets');

  navigateToShippingSheets() {
    this.activeTab.set('shipping-sheets');
    this.router.navigate(['/app/shipping/manage/shipping-sheets']);
  }

  navigateToPullSheets() {
    this.activeTab.set('pull-sheets');
    this.router.navigate(['/app/shipping/manage/pull-sheets']);
  }

  trackByShippingSheet(index: number, shippingSheet: ShippingSheet) { 
    return `${shippingSheet.shipmentNum}-${shippingSheet.shipmentYear}`;
  }

  setSelectedShippingSheet(shippingSheet: ShippingSheet) {
    this.selectedShippingSheetService.setShippingSheet(shippingSheet);
    this.router.navigate(['/app/shipping/ship-sheet']); 
  }

  onShippingSheetClick(shippingSheet: ShippingSheet) {
    this.setSelectedShippingSheet(shippingSheet);
  }

  constructor() {
    this.shippingSheetService.getAllShippingSheets();
    this.shipSheetDetailService.getAllShipSheetDetails();
    this.varietyService.getVarieties();
    this.rootstockService.getRootstocks();
    this.plantedTypeService.getPlantedTypes();
    this.plantedFieldService.getPlantedFields();
    this.digTreeSizeService.getDigTreeSizes();
    this.containerTypeService.getContainerTypes();
    this.customerService.getCustomers();

    if (this.selectedShippingSheet()) { 
      const currentUrl = this.router.url;
      if (!currentUrl.includes('/ship-sheet')) {
        this.router.navigate(['/app/shipping/ship-sheet']);
      }
    }
  }
}
