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
  IonChip,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonIcon,
  IonModal,
  IonTitle, 
  IonButtons,
  IonButton,
  IonInput
} from "@ionic/angular/standalone";

import { CachedSettingsService, SETTINGS_IDENTIFIER } from 'src/app/modules/global/services/cached-settings.service';
import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';
import { PlantedRootPool, PlantedRootPoolService } from '../../services/planted-root-pool.service';
import { BuddedRootPoolEntry, BuddedRootPoolEntryService } from '../../services/budded-root-pool-entry.service';
import { BuddedRootPool, BuddedRootPoolService } from '../../services/budded-root-pool.service';
import { defaultPlantedField, PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { Supplier, SupplierService } from 'src/app/modules/sourcelists/services/supplier.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { Employee, EmployeeService } from 'src/app/modules/sourcelists/services/employee.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { BuddingEntryFormComponent } from '../../components/budding-entry-form/budding-entry-form.component';
import { Utils } from 'src/app/modules/global/classes/utils';

export interface PlantedRootPoolListRecord {
  plantedRootPool: PlantedRootPool;
  field: PlantedField;
  plantedType: PlantedType;
  rootstock: Rootstock;
  supplier: Supplier;
  plantedVariety: Variety | null;
  firstBuddingEntryVariety: Variety | null;
  firstBuddingEntryDateBudded: Date | null;
  firstBuddingEntryBudder: Employee | null;
  firstBuddingEntryCustomer: Supplier | null;
  buddingEntries: BuddedRootPoolEntry[];
  totalBudded: number;
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
    IonChip,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonIcon,
    IonModal,
    IonTitle, 
    IonButtons,
    IonButton,
    IonInput,
    PageTopbarComponent,
    ContentTopbarComponent,
    BuddingEntryFormComponent
  ],
  providers: [
    { provide: SETTINGS_IDENTIFIER, useValue: 'PlantedRootPools' },
    CachedSettingsService
  ]
})
export class PlantedRootPoolsPage { 

  router: Router = inject(Router);
  cachedSettingsService: CachedSettingsService = inject(CachedSettingsService);
  selectedPlantedRootPoolService: SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);

  plantedRootPoolService: PlantedRootPoolService = inject(PlantedRootPoolService);
  buddedRootPoolService: BuddedRootPoolService = inject(BuddedRootPoolService);
  buddedRootPoolEntryService: BuddedRootPoolEntryService = inject(BuddedRootPoolEntryService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  rootstockService: RootstockService = inject(RootstockService);
  supplierService: SupplierService = inject(SupplierService);
  varietyService: VarietyService = inject(VarietyService);
  employeeService: EmployeeService = inject(EmployeeService);
  customerService: CustomerService = inject(CustomerService);

  plantedRootPoolServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedRootPoolService.statusSubject, { requireSync: true });
  buddedRootPoolServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.buddedRootPoolService.statusSubject, { requireSync: true });
  buddedRootPoolEntryServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>  = toSignal(this.buddedRootPoolEntryService.statusSubject, { requireSync: true });
  plantedFieldServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedFieldService.statusSubject, { requireSync: true });
  plantedTypeServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedTypeService.statusSubject, { requireSync: true });
  rootstockServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.rootstockService.statusSubject, { requireSync: true });
  supplierServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.supplierService.statusSubject, { requireSync: true });
  varietyServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.varietyService.statusSubject, { requireSync: true });
  employeeServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.employeeService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });

  buddedRootPoolEntryServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.buddedRootPoolEntryService.previousDataOperation, { initialValue: null });

  isFetchingData: Signal<boolean> = computed(() => {
    return [
      this.plantedRootPoolServiceStatus(),
      this.buddedRootPoolServiceStatus(),
      this.buddedRootPoolEntryServiceStatus(),
      this.plantedFieldServiceStatus(),
      this.plantedTypeServiceStatus(),
      this.rootstockServiceStatus(),
      this.supplierServiceStatus(),
      this.varietyServiceStatus(),
      this.employeeServiceStatus(),
      this.customerServiceStatus(),
    ].some(status => ['fetching', 'creating', 'updating', 'deleting'].includes(status));
  });

  plantedRootPools: Signal<PlantedRootPool[]> = toSignal(this.plantedRootPoolService.plantedRootPools, { initialValue: [] });
  buddedRootPools: Signal<BuddedRootPool[]> = toSignal(this.buddedRootPoolService.buddedRootPools, { initialValue: [] });
  buddedRootPoolEntries: Signal<BuddedRootPoolEntry[]> = toSignal(this.buddedRootPoolEntryService.buddedRootPoolEntries, { initialValue: [] });
  plantedFields: Signal<PlantedField[]> = toSignal(this.plantedFieldService.plantedFields, { initialValue: [] });
  plantedTypes: Signal<PlantedType[]> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: [] });
  rootstocks: Signal<Rootstock[]> = toSignal(this.rootstockService.rootstocks, { initialValue: [] });
  suppliers: Signal<Supplier[]> = toSignal(this.supplierService.suppliers, { initialValue: [] });
  varieties: Signal<Variety[]> = toSignal(this.varietyService.varieties, { initialValue: [] });
  employees: Signal<Employee[]> = toSignal(this.employeeService.employees, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  constructor() {
    this.triggerFilterSettings.set(true);
  }

  plantedRootPoolListRecords: Signal<PlantedRootPoolListRecord[]> = computed(() => { 
    if (this.plantedRootPools().length === 0) { return []; }
    if (this.buddedRootPools().length === 0) { return []; }
    if (this.buddedRootPoolEntries().length === 0) { return []; }
    if (this.plantedFields().length === 0) { return []; }
    if (this.plantedTypes().length === 0) { return []; }
    if (this.rootstocks().length === 0) { return []; }
    if (this.suppliers().length === 0) { return []; }
    if (this.varieties().length === 0) { return []; }
    if (this.employees().length === 0) { return []; }
    if (this.customers().length === 0) { return []; }

    return this.plantedRootPools().map(plantedRootPool => {

      const buddedRootPools = this.buddedRootPools().filter(buddedRootPool => buddedRootPool.plantedRootPoolId === plantedRootPool.id);
      const buddingEntries = buddedRootPools
        .flatMap(buddedRootPool => this.buddedRootPoolEntries().filter(entry => entry.buddedRootPoolId === buddedRootPool.id))
        .sort((a, b) => new Date(a.dateBudded).getTime() - new Date(b.dateBudded).getTime());

      const firstBuddingEntry = buddingEntries.length > 0 ? buddingEntries[0] : null;
      const firstBuddingEntryBuddedRootPool = firstBuddingEntry ? this.buddedRootPools().find(buddedRootPool => buddedRootPool.id === firstBuddingEntry.buddedRootPoolId) : null;

      const firstBuddingEntryVariety = (firstBuddingEntry && firstBuddingEntryBuddedRootPool) ? this.varieties().find(variety => variety.id === firstBuddingEntryBuddedRootPool.varietyId) || null : null;
      const firstBuddingEntryDateBudded = firstBuddingEntry ? new Date(firstBuddingEntry.dateBudded) : null;
      const firstBuddingEntryBudder = firstBuddingEntry ? this.employees().find(employee => employee.id === firstBuddingEntry.budderEmployeeId) || null : null;
      const firstBuddingEntryCustomer = firstBuddingEntry ? this.customers().find(customer => customer.id === firstBuddingEntry.customerId) || null : null;

      return {
        plantedRootPool: plantedRootPool,
        field: this.plantedFields().find(field => field.id === plantedRootPool.fieldId)!,
        plantedType: this.plantedTypes().find(type => type.id === plantedRootPool.plantedTypeId)!,
        rootstock: this.rootstocks().find(rootstock => rootstock.id === plantedRootPool.rootstockId)!,
        supplier: this.suppliers().find(supplier => supplier.id === plantedRootPool.supplierId)!,
        plantedVariety: this.varieties().find(variety => variety.id === plantedRootPool.plantedVarietyId) || null,
        firstBuddingEntryVariety: firstBuddingEntryVariety,
        firstBuddingEntryDateBudded: firstBuddingEntryDateBudded,
        firstBuddingEntryBudder: firstBuddingEntryBudder,
        firstBuddingEntryCustomer: firstBuddingEntryCustomer,
        buddingEntries: buddingEntries,
        totalBudded: buddingEntries.reduce((total, buddedRootPoolEntry) => total + (buddedRootPoolEntry.quantityBudded || 0), 0)
      };
    });
  });

  plantedRootPoolPlantedYears: Signal<number[]> = computed<number[]>(() => { 
    if (this.plantedRootPoolListRecords().length === 0) { return []; }

    return [
      ...new Set(this.plantedRootPoolListRecords()
      .map(record => Number(record.plantedRootPool.plantedYear))
    )].sort((a, b) => Number(b) - Number(a));
  });

  plantedRootPoolListRecordsEffect = effect(() => { 
    if (this.isFetchingData()) { return; }
    if (this.cachedSettings() !== null) { return; }
    if (this.plantedRootPoolListRecords().length === 0) { return; }

    const isCurrentYearPresent = this.plantedRootPoolPlantedYears().includes(new Date().getFullYear());
    if (isCurrentYearPresent) {
      this.yearFilter.set(new Date().getFullYear());
    } else {
      this.yearFilter.set(this.plantedRootPoolPlantedYears()[0]);
    }
  });


  filteredPlantedFieldsForYear: Signal<PlantedField[]> = computed(() => {
    if (this.plantedRootPoolListRecords().length === 0) { return []; }

    return [
      ...new Set(
        this.plantedRootPoolListRecords()
          .filter(plantedRootPool => Number(plantedRootPool.plantedRootPool.plantedYear) === this.yearFilter())
          .map(record => record.field)
          .filter(field => field.active)
          .sort((a, b) => a.field.localeCompare(b.field))
      )
    ]
  });

  globalSearchFilter: WritableSignal<string> = signal('');
  yearFilter: WritableSignal<number | null> = signal(null);
  fieldFilter: WritableSignal<PlantedField | null> = signal(null);
  rowFilter: WritableSignal<number | null> = signal(null);

  cachedSettings = toSignal(this.cachedSettingsService.cachedSettings, { initialValue: null });

  filtersEffect = effect(() => { 
    if (this.triggerFilterSettings()) { return; }
    
    this.cachedSettingsService.setSettings({
      globalSearchFilter: this.globalSearchFilter(),
      fieldFilter: this.fieldFilter(),
      yearFilter: this.yearFilter(),
      rowFilter: this.rowFilter()
    });
  });

  filteredPlantedRootPoolListRecords: Signal<PlantedRootPoolListRecord[]> = computed(() => { 
    if (this.plantedRootPoolListRecords().length === 0) { return []; }

    return this.plantedRootPoolListRecords()
      .sort((a, b) => { 
        return a.plantedRootPool.row - b.plantedRootPool.row
      })
      .filter(record => {
        if (this.fieldFilter() === null) { return false; }
        return record.field.id === this.fieldFilter()!.id
      })
      .filter(record => Number(record.plantedRootPool.plantedYear) === this.yearFilter())
      .filter(record => {
        if (this.rowFilter() === null) { return true; }
        return record.plantedRootPool.row.toString().startsWith(this.rowFilter()!.toString());
      })
      .filter(record => {
        if (this.globalSearchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());
      });
  });
  
  triggerFilterSettings: WritableSignal<boolean> = signal(false);

  filteredPlantedRootPoolListRecordsEffect = effect(() => {
    if (this.isFetchingData()) { return; }
    if (this.plantedRootPoolListRecords().length === 0) { return; }
    if (this.cachedSettings() === null) { return; }
    if (!this.triggerFilterSettings()) { return; }

    this.triggerFilterSettings.set(false);

    if (this.cachedSettings().globalSearchFilter) {
      this.globalSearchFilter.set(String(this.cachedSettings().globalSearchFilter));
    }

    if (this.cachedSettings().fieldFilter) {
      this.fieldFilter.set(this.cachedSettings().fieldFilter as PlantedField);
    }

    if (this.cachedSettings().yearFilter) {
      this.yearFilter.set(Number(this.cachedSettings().yearFilter));
    }

    if (this.cachedSettings().rowFilter) {
      this.rowFilter.set(Number(this.cachedSettings().rowFilter));
    }
  });

  trackByPlantedRootPool(index: number, record: PlantedRootPoolListRecord) { 
    return record.plantedRootPool.id;
  }
  
  fieldCompare(a: PlantedField, b: PlantedField) {
    return a.id === b.id;
  }

  setSelectedPlantedRootPool(record: PlantedRootPoolListRecord) { 
    this.selectedPlantedRootPoolService.setPlantedRootPool(record.plantedRootPool);
    this.router.navigate(['/app/budding/planting']); 
  }

  isCreatingBuddingEntry: WritableSignal<boolean> = signal(false);
  selectedPlantedRootPool: WritableSignal<PlantedRootPool | null> = signal(null);

  justCreatedBuddedRootPoolEntryEffect = effect(() => {
    if (this.buddedRootPoolEntryServicePreviousDataOperation() !== 'created') { return; }
    if (this.buddedRootPoolEntryServiceStatus() !== 'stable') { return; }
    
    this.isCreatingBuddingEntry.set(false);
    this.triggerFilterSettings.set(true);
  });
}
