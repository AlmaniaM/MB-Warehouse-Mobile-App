import { 
  Component, 
  computed, 
  effect, 
  inject,
  signal, 
  Signal, 
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonHeader,
  IonSelect,
  IonProgressBar,
  IonSelectOption, 
  IonText, 
  IonNote,
  IonToolbar, 
  IonSearchbar, 
  IonAccordionGroup, 
  IonAccordion,
  IonInput
} from "@ionic/angular/standalone";

import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';
import { PlantedRootPool, PlantedRootPoolService } from '../../services/planted-root-pool.service';
import { defaultPlantedField, PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { Supplier, SupplierService } from 'src/app/modules/sourcelists/services/supplier.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';

export interface PlantedRootPoolListRecord {
  plantedRootPool: PlantedRootPool;
  field: PlantedField;
  plantedType: PlantedType;
  rootstock: Rootstock;
  supplier: Supplier;
  plantedVariety: Variety | null;
}

@Component({
  selector: 'app-planted-root-pools',
  templateUrl: './planted-root-pools.page.html',
  styleUrls: ['./planted-root-pools.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    IonAccordion, 
    IonAccordionGroup, 
    IonContent,
    IonHeader, 
    IonList,
    IonItem, 
    IonToolbar, 
    IonSearchbar, 
    IonLabel,
    IonSelect,
    IonProgressBar,
    IonSelectOption, 
    IonText, 
    IonNote,  
    IonInput,
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class PlantedRootPoolsPage { 

  router: Router = inject(Router);
  selectedPlantedRootPoolService: SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);

  plantedRootPoolService: PlantedRootPoolService = inject(PlantedRootPoolService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  rootstockService: RootstockService = inject(RootstockService);
  supplierService: SupplierService = inject(SupplierService);
  varietyService: VarietyService = inject(VarietyService);

  plantedRootPoolServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedRootPoolService.statusSubject, { requireSync: true });
  plantedFieldServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedFieldService.statusSubject, { requireSync: true });
  plantedTypeServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedTypeService.statusSubject, { requireSync: true });
  rootstockServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.rootstockService.statusSubject, { requireSync: true });
  supplierServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.supplierService.statusSubject, { requireSync: true });
  varietyServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.varietyService.statusSubject, { requireSync: true });

  isFetchingData: Signal<boolean> = computed(() => {
    return [
      this.plantedRootPoolServiceStatus(),
      this.plantedFieldServiceStatus(),
      this.plantedTypeServiceStatus(),
      this.rootstockServiceStatus(),
      this.supplierServiceStatus(),
      this.varietyServiceStatus(),
    ].some(status => ['fetching', 'creating', 'updating', 'deleting'].includes(status));
  });

  plantedRootPools: Signal<PlantedRootPool[]> = toSignal(this.plantedRootPoolService.plantedRootPools, { initialValue: [] });
  plantedFields: Signal<PlantedField[]> = toSignal(this.plantedFieldService.plantedFields, { initialValue: [] });
  plantedTypes: Signal<PlantedType[]> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: [] });
  rootstocks: Signal<Rootstock[]> = toSignal(this.rootstockService.rootstocks, { initialValue: [] });
  suppliers: Signal<Supplier[]> = toSignal(this.supplierService.suppliers, { initialValue: [] });
  varieties: Signal<Variety[]> = toSignal(this.varietyService.varieties, { initialValue: [] });

  activePlantedFields: Signal<PlantedField[]> = computed(() => {
    if (this.plantedFields().length === 0) { return []; }
    return this.plantedFields().filter(field => field.active);
  });

  sortedPlantedFields: Signal<PlantedField[]> = computed(() => {
    if (this.activePlantedFields().length === 0) { return []; }
    return this.activePlantedFields().sort((a, b) => a.field.localeCompare(b.field));
  });

  sortedPlantedFieldsEffect = effect(() => { 
    if (this.sortedPlantedFields().length === 0) { return; }
    if (this.fieldFilter().id !== defaultPlantedField.id) { return; }

    this.fieldFilter.set(this.sortedPlantedFields()[0]);
  });

  plantedRootPoolListRecords: Signal<PlantedRootPoolListRecord[]> = computed(() => { 
    if (this.plantedRootPools().length === 0) { return []; }
    if (this.plantedFields().length === 0) { return []; }
    if (this.plantedTypes().length === 0) { return []; }
    if (this.rootstocks().length === 0) { return []; }
    if (this.suppliers().length === 0) { return []; }
    if (this.varieties().length === 0) { return []; }

    return this.plantedRootPools().map(plantedRootPool => {
      return {
        plantedRootPool: plantedRootPool,
        field: this.plantedFields().find(field => field.id === plantedRootPool.fieldId)!,
        plantedType: this.plantedTypes().find(type => type.id === plantedRootPool.plantedTypeId)!,
        rootstock: this.rootstocks().find(rootstock => rootstock.id === plantedRootPool.rootstockId)!,
        supplier: this.suppliers().find(supplier => supplier.id === plantedRootPool.supplierId)!,
        plantedVariety: this.varieties().find(variety => variety.id === plantedRootPool.plantedVarietyId) || null
      };
    });
  });

  globalSearchFilter: WritableSignal<string> = signal('');
  fieldFilter: WritableSignal<PlantedField> = signal(defaultPlantedField);
  yearFilter: WritableSignal<number> = signal(new Date().getFullYear());
  rowFilter: WritableSignal<number | null> = signal(null);

  plantedRootPoolListRecordsForField: Signal<PlantedRootPoolListRecord[]> = computed(() => {
    if (this.fieldFilter().id === defaultPlantedField.id) { return []; }
    if (this.plantedRootPoolListRecords().length === 0) { return []; }

    return this.plantedRootPoolListRecords()
      .filter(record => record.field.id === this.fieldFilter().id)
  });

  plantedRootPoolPlantedYears: Signal<number[]> = computed<number[]>(() => { 
    if (this.plantedRootPoolListRecordsForField().length === 0) { return []; }

    return [
      ...new Set(this.plantedRootPoolListRecordsForField()
      .map(record => Number(record.plantedRootPool.plantedYear))
    )].sort((a, b) => Number(b) - Number(a));
  });

  plantedRootPoolPlantedYearsEffect = effect(() => { 
    if (this.plantedRootPoolPlantedYears().length === 0) { return; }
    this.yearFilter.set(this.plantedRootPoolPlantedYears()[0]);
  });

  filteredPlantedRootPoolListRecords: Signal<PlantedRootPoolListRecord[]> = computed(() => { 
    if (this.plantedRootPoolListRecordsForField().length === 0) { return []; }

    return this.plantedRootPoolListRecordsForField()
      .sort((a, b) => { 
        return a.plantedRootPool.row - b.plantedRootPool.row
      })
      .filter(record => Number(record.plantedRootPool.plantedYear) === this.yearFilter())
      .filter(record => {
        if (this.rowFilter() === null) { return true; }
        return record.plantedRootPool.row === this.rowFilter();
      })
      .filter(record => {
        if (this.globalSearchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());
      });
  });
  
  trackByPlantedRootPool(index: number, record: PlantedRootPoolListRecord) { 
    return record.plantedRootPool.id;
  }

  setSelectedPlantedRootPool(record: PlantedRootPoolListRecord) { 
    this.selectedPlantedRootPoolService.setPlantedRootPool(record.plantedRootPool);
    this.router.navigate(['/app/budding/planted-root-pool']); 
  }
}
