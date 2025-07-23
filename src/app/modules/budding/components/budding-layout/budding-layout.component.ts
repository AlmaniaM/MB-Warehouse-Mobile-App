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

import { SelectedPlantedRootPoolService } from 'src/app/modules/budding/services/selected-planted-root-pool.service';
import { PlantedRootPool, PlantedRootPoolService } from 'src/app/modules/budding/services/planted-root-pool.service';
import { CustomerService } from 'src/app/modules/sourcelists/services/customer.service';
import { BuddedRootPoolEntryService } from 'src/app/modules/budding/services/budded-root-pool-entry.service';
import { BuddedRootPoolService } from 'src/app/modules/budding/services/budded-root-pool.service';
import { EmployeeService } from 'src/app/modules/sourcelists/services/employee.service';
import { PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { SupplierService } from 'src/app/modules/sourcelists/services/supplier.service';
import { VarietyService } from 'src/app/modules/sourcelists/services/variety.service';

@Component({
  selector: 'app-budding-layout',
  templateUrl: './budding-layout.component.html',
  styleUrls: ['./budding-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ],
})
export class BuddingLayoutComponent  {

  router: Router = inject(Router);
	routerNavigationEvent: Signal<RouterEvent | null> = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd)), { initialValue: null });

  isInEntryPage: Signal<boolean> = computed<boolean>(() => { 
    if (this.routerNavigationEvent() === null) { return false; }
    const url = (this.routerNavigationEvent() as NavigationEnd).urlAfterRedirects;
    return url.includes('/entry');
  });
  
  buddedRootPoolService: BuddedRootPoolService = inject(BuddedRootPoolService);
  buddedRootPoolEntryService: BuddedRootPoolEntryService = inject(BuddedRootPoolEntryService);
  plantedRootPoolService: PlantedRootPoolService = inject(PlantedRootPoolService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  supplierService: SupplierService = inject(SupplierService);
  rootstockService: RootstockService = inject(RootstockService);
  varietyService: VarietyService = inject(VarietyService);
  employeeService: EmployeeService = inject(EmployeeService);
  customerService: CustomerService = inject(CustomerService);
  
  selectedPlantedRootPoolService: SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);
  selectedPlantedRootPool: Signal<PlantedRootPool | null> = toSignal(this.selectedPlantedRootPoolService.selectedPlantedRootPool, { initialValue: null });
  
  constructor() {
    
    this.buddedRootPoolService.getBuddedRootPools();
    this.buddedRootPoolEntryService.getBuddedRootPoolEntries();
    this.plantedRootPoolService.getPlantedRootPools();
    this.plantedFieldService.getPlantedFields();
    this.plantedTypeService.getPlantedTypes();
    this.supplierService.getSuppliers();
    this.rootstockService.getRootstocks();
    this.varietyService.getVarieties();
    this.employeeService.getEmployees();
    this.customerService.getCustomers();

    if (this.selectedPlantedRootPool()) { 
      this.router.navigate(['/app/budding/entry']); 
    }
  }
}