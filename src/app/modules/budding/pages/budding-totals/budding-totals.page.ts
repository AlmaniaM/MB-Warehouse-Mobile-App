import { Component, computed, effect, inject, signal, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonHeader,
  IonSelect,
  IonProgressBar,
  IonSelectOption,
  IonToolbar, 
  IonSearchbar, 
  IonAccordionGroup, 
  IonAccordion,
} from "@ionic/angular/standalone";

import { PageTopbarComponent } from "src/app/modules/global/components/page-topbar/page-topbar.component";
import { ContentTopbarComponent } from "src/app/modules/global/components/content-topbar/content-topbar.component";

import { BuddedRootPoolEntry, BuddedRootPoolEntryService, defaultBuddedRootPoolEntry } from '../../services/budded-root-pool-entry.service';
import { defaultPlantedField, PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { defaultPlantedType, PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { defaultRootstock, Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { defaultSupplier, Supplier, SupplierService } from 'src/app/modules/sourcelists/services/supplier.service';
import { defaultVariety, Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { defaultEmployee, Employee, EmployeeService } from 'src/app/modules/sourcelists/services/employee.service';
import { Customer, CustomerService, defaultCustomer } from 'src/app/modules/sourcelists/services/customer.service';
import { BuddedRootPool, BuddedRootPoolService, defaultBuddedRootPool } from '../../services/budded-root-pool.service';
import { defaultPlantedRootPool, PlantedRootPool, PlantedRootPoolService } from '../../services/planted-root-pool.service';
import { CachedSettingsService, SETTINGS_IDENTIFIER } from 'src/app/modules/global/services/cached-settings.service';

interface BuddedRootPoolEntryListForTotalsRecord {
  buddedRootPoolEntry: BuddedRootPoolEntry;
  buddedRootPool: BuddedRootPool;
  plantedRootPool: PlantedRootPool;
  customerRecord: Customer;
  budderEmployeeRecord: Employee;
  plantedFieldRecord: PlantedField;
  varietyRecord: Variety;
  plantedTypeRecord: PlantedType;
  supplierRecord: Supplier;
  rootstockRecord: Rootstock;
}

const defaultBuddedRootPoolEntryListForTotalsRecord: BuddedRootPoolEntryListForTotalsRecord = {
  buddedRootPoolEntry: defaultBuddedRootPoolEntry,
  buddedRootPool: defaultBuddedRootPool,
  plantedRootPool: defaultPlantedRootPool,
  customerRecord: defaultCustomer,
  budderEmployeeRecord: defaultEmployee,
  plantedFieldRecord: defaultPlantedField,
  varietyRecord: defaultVariety,
  plantedTypeRecord: defaultPlantedType,
  supplierRecord: defaultSupplier,
  rootstockRecord: defaultRootstock,
};

interface BuddedRootPoolEntryTotalByDayRecord {
  date: string;
  total: number;
  entries: BuddedRootPoolEntryListForTotalsRecord[];
}

interface BuddedRootPoolEntryTotalByVarietyAndRootstockRecord {
  variety: Variety;
  rootstock: Rootstock;
  total: number;
  entries: BuddedRootPoolEntryListForTotalsRecord[];
}

interface BuddedRootPoolEntryTotalByBudderRecord {
  budder: Employee;
  total: number;
  entries: BuddedRootPoolEntryListForTotalsRecord[];
}

interface RowsWithBuddedRootPoolEntries {
  date: string;
  row: number;
  entries: BuddedRootPoolEntryListForTotalsRecord[];
}

interface DatesWithRows {
  date: string;
  rows: RowsWithBuddedRootPoolEntries[];
}


@Component({
  selector: 'app-budding-totals',
  templateUrl: './budding-totals.page.html',
  styleUrls: ['./budding-totals.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    PageTopbarComponent,
    ContentTopbarComponent
],
  providers: [
    { provide: SETTINGS_IDENTIFIER, useValue: 'BuddingTotals' },
    CachedSettingsService
  ]
})
export class BuddingTotalsPage {

  router: Router = inject(Router);
  cachedSettingsService: CachedSettingsService = inject(CachedSettingsService);
  

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

  buddingEntriesListForTotalsRecords: Signal<BuddedRootPoolEntryListForTotalsRecord[]> = computed(() => {
    
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

    return this.buddedRootPoolEntries().map(entry => {

      const buddedRootPool = this.buddedRootPools().find(pool => pool.id === entry.buddedRootPoolId);
      const plantedRootPool = this.plantedRootPools().find(pool => pool.id === buddedRootPool?.plantedRootPoolId);

      if (!buddedRootPool || !plantedRootPool) { return defaultBuddedRootPoolEntryListForTotalsRecord; }

      return {
        buddedRootPoolEntry: entry,
        buddedRootPool: buddedRootPool,
        plantedRootPool: plantedRootPool,
        customerRecord: this.customers().find(customer => customer.id === entry.customerId)!,
        budderEmployeeRecord: this.employees().find(employee => employee.id === entry.budderEmployeeId)!,
        plantedFieldRecord: this.plantedFields().find(field => field.id === plantedRootPool?.fieldId)!,
        varietyRecord: this.varieties().find(variety => variety.id === buddedRootPool?.varietyId)!,
        plantedTypeRecord: this.plantedTypes().find(type => type.id === plantedRootPool?.plantedTypeId)!,
        supplierRecord: this.suppliers().find(supplier => supplier.id === plantedRootPool?.supplierId)!,
        rootstockRecord: this.rootstocks().find(stock => stock.id === plantedRootPool?.rootstockId)!,
      };
    });
  });

  buddingEntryYears: Signal<number[]> = computed(() => {
    return Array.from(new Set(this.buddingEntriesListForTotalsRecords().map(record => new Date(record.buddedRootPoolEntry.dateBudded).getFullYear()))).sort((a, b) => b - a);
  });

  filteredBuddingEntriesForTotalsTable: Signal<BuddedRootPoolEntryListForTotalsRecord[]> = computed(() => {
    if (this.buddingEntriesListForTotalsRecords().length === 0) { return []; }

    return this.buddingEntriesListForTotalsRecords()
      .filter(record => {
        if (this.fieldFilter() === null) { return true; }
        return record.plantedFieldRecord.id === this.fieldFilter()?.id;
      })
      .filter(record => {
        if (this.yearFilter() === null) { return true; }
        return new Date(record.buddedRootPoolEntry.dateBudded).getFullYear() === this.yearFilter();
      })
      .filter(record => {
        if (this.globalSearchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());
      });
  });

  // for totals by day

  buddedEntriesTotalsByDayRecords: Signal<BuddedRootPoolEntryTotalByDayRecord[]> = computed(() => {
    if (this.filteredBuddingEntriesForTotalsTable().length === 0) { return []; }

    const dates = Array.from(new Set(this.filteredBuddingEntriesForTotalsTable().map(record => { return new Date(record.buddedRootPoolEntry.dateBudded).toDateString(); })))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return dates.map(date => {
      const entriesForDate = this.filteredBuddingEntriesForTotalsTable().filter(record => new Date(record.buddedRootPoolEntry.dateBudded).toDateString() === date);
      const total = entriesForDate.reduce((sum, record) => sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0);
      return {
        date: date,
        total: total,
        entries: entriesForDate
      };
    });
  });

  //totals by variety and rootstock
  buddedEntriesTotalsByVarietyAndRootstockRecords: Signal<BuddedRootPoolEntryTotalByVarietyAndRootstockRecord[]> = computed(() => {
    if (this.filteredBuddingEntriesForTotalsTable().length === 0) { return []; }

    const varieties = Array.from(new Set(this.filteredBuddingEntriesForTotalsTable().map(record => record.varietyRecord)));
    const rootstocks = Array.from(new Set(this.filteredBuddingEntriesForTotalsTable().map(record => record.rootstockRecord)));

    return varieties.flatMap(variety => {
      return rootstocks.map(rootstock => {
        const entries = this.filteredBuddingEntriesForTotalsTable().filter(record => {
          return record.varietyRecord && record.rootstockRecord && 
                 record.varietyRecord.id === variety.id && 
                 record.rootstockRecord.id === rootstock.id;
        });
        const total = entries.reduce((sum, record) => sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0);
        return {
          variety: variety,
          rootstock: rootstock,
          total: total,
          entries: entries
        };
      });
    });
  });

  //totals by budder
  buddedEntriesTotalsByBudderRecords: Signal<BuddedRootPoolEntryTotalByBudderRecord[]> = computed(() => {
    if (this.filteredBuddingEntriesForTotalsTable().length === 0) { return []; }

    const recordsWithValidBudders = this.filteredBuddingEntriesForTotalsTable()
      .filter(record => record.budderEmployeeRecord && record.budderEmployeeRecord.id !== undefined);
    
    if (recordsWithValidBudders.length === 0) { return []; }

    const budders = Array.from(new Set(recordsWithValidBudders.map(record => record.budderEmployeeRecord)))
    .filter(budder => budder !== undefined && budder !== null);

    return budders.map(budder => {
      if (!budder) return { budder: defaultEmployee, total: 0, entries: [] };
      
      const entries = recordsWithValidBudders.filter(record => 
        record.budderEmployeeRecord && 
        record.budderEmployeeRecord.id === budder.id
      );
      
      const total = entries.reduce((sum, record) => 
        sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0
      );
      
      return {
        budder: budder,
        total: total,
        entries: entries
      };
    });
  });

  // list completed rows by day
  completedRowsWithEntries: Signal<RowsWithBuddedRootPoolEntries[]> = computed(() => {
    if (this.filteredBuddingEntriesForTotalsTable().length === 0) { return []; }

    const completedEntries = this.filteredBuddingEntriesForTotalsTable().filter(record => record.plantedRootPool.buddingComplete);
    const rows = Array.from(new Set(completedEntries.map(record => record.plantedRootPool.row)));

    let completedRowsWithMostRecentDate = [];
    for (const row of rows) {
      const entriesForRow = completedEntries.filter(record => record.plantedRootPool.row === row);

      const mostRecentEntry = entriesForRow.reduce((latest, current) => {
        return latest.buddedRootPoolEntry.dateBudded > current.buddedRootPoolEntry.dateBudded ? latest : current;
      });

      completedRowsWithMostRecentDate.push({
        row: row,
        date: new Date(mostRecentEntry.buddedRootPoolEntry.dateBudded).toDateString(),
        entries: entriesForRow
      });
    }
    return completedRowsWithMostRecentDate.sort((a, b) => {
      return a.date > b.date ? -1 : 1;
    });
  });

  datesWithCompletedRows: Signal<DatesWithRows[]> = computed(() => {
    const uniqueDates = Array.from(new Set(this.completedRowsWithEntries().map(row => row.date))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return uniqueDates.map(date => ({
      date: date,
      rows: this.completedRowsWithEntries().filter(row => row.date === date)
    }));
  });

  globalSearchFilter: WritableSignal<string> = signal('');
  yearFilter: WritableSignal<number | null> = signal(new Date().getFullYear());
  fieldFilter: WritableSignal<PlantedField | null> = signal(null);
  viewFilter: WritableSignal<'totalsByDay'| 'totalsByVarietyAndRootstock' | 'totalsByBudder'| 'completedRowsByDay'> = signal('totalsByDay');

  cachedSettings = toSignal(this.cachedSettingsService.cachedSettings, { initialValue: null });
  triggerFilterSettings: WritableSignal<boolean> = signal(false);

  filtersEffect = effect(() => { 
    if (this.triggerFilterSettings()) { return; }
    
    this.cachedSettingsService.setSettings({
      globalSearchFilter: this.globalSearchFilter(),
      fieldFilter: this.fieldFilter(),
      yearFilter: this.yearFilter(),
    });
  });

  filteredBuddingEntriesEffect = effect(() => {
    if (this.isFetchingData()) { return; }
    if (this.buddingEntriesListForTotalsRecords().length === 0) { return; }
    if (this.cachedSettings() === null) { 
      this.triggerFilterSettings.set(false);
    }
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

  });

  fieldCompare(a: PlantedField | null, b: PlantedField | null) {
    if (a === null && b === null) { return true; }
    if (a === null || b === null) { return false; }
    return a.id === b.id;
  }

}
