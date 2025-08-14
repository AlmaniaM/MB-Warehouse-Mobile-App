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
  IonItemDivider,
  IonItemGroup,
  IonNote,
  IonChip,
  IonFooter,
  IonTitle,
  IonText
} from "@ionic/angular/standalone";

import { PageTopbarComponent } from "src/app/modules/global/components/page-topbar/page-topbar.component";
import { ContentTopbarComponent } from "src/app/modules/global/components/content-topbar/content-topbar.component";

import { BuddedRootPoolEntry, BuddedRootPoolEntryService } from '../../services/budded-root-pool-entry.service';
import {  PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { Supplier, SupplierService } from 'src/app/modules/sourcelists/services/supplier.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { Employee, EmployeeService } from 'src/app/modules/sourcelists/services/employee.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';
import { BuddedRootPool, BuddedRootPoolService } from '../../services/budded-root-pool.service';
import { PlantedRootPool, PlantedRootPoolService } from '../../services/planted-root-pool.service';
import { CachedSettingsService, SETTINGS_IDENTIFIER } from 'src/app/modules/global/services/cached-settings.service';

interface BuddingEntryTotalListRecord {
  buddedRootPoolEntry: BuddedRootPoolEntry;
  buddedRootPool: BuddedRootPool;
  plantedRootPool: PlantedRootPool;
  customerRecord: Customer | null;
  budderEmployeeRecord: Employee | null;
  plantedFieldRecord: PlantedField;
  varietyRecord: Variety;
  plantedTypeRecord: PlantedType;
  supplierRecord: Supplier;
  rootstockRecord: Rootstock;
}

interface TotalByDayListRecord {
  date: string;
  buddingEntries: BuddingEntryTotalListRecord[];
  totalBuddedQuantity: number;
}

interface TotalByVarietyAndRootstockListRecord {
  variety: Variety;
  rootstock: Rootstock;
  buddingEntries: BuddingEntryTotalListRecord[];
  totalBuddedQuantity: number;
}

interface TotalByBudderListRecord {
  budder: Employee;
  buddingEntries: BuddingEntryTotalListRecord[];
  totalBuddedQuantity: number;
}

interface CompletedRow {
  row: number;
  plantings: PlantedRootPool[];
  buddingEntries: BuddingEntryTotalListRecord[];
  dateCompleted: Date;
  totalBuddedQuantity: number;
}

interface DateWithCompletedRows { 
  dateCompleted: string;
  completedRows: CompletedRow[];
  totalBuddedQuantity: number;
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
    IonItemDivider,
    IonItemGroup,
    IonNote,
    IonChip,
    IonFooter,
    IonTitle,
    IonText,
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

  plantedRootPoolPlantedYears: Signal<number[]> = computed<number[]>(() => { 
    if (this.plantedRootPools().length === 0) { return []; }

    return [
      ...new Set(this.plantedRootPools()
      .map(record => Number(record.plantedYear))
    )].sort((a, b) => Number(b) - Number(a));
  });


  plantedRootPoolListRecordsEffect = effect(() => { 
    if (this.isFetchingData()) { return; }
    if (this.cachedSettings() !== null) { return; }
    if (this.plantedRootPoolPlantedYears().length === 0) { return; }

    const isCurrentYearPresent = this.plantedRootPoolPlantedYears().includes(new Date().getFullYear());
    if (isCurrentYearPresent) {
      this.yearFilter.set(new Date().getFullYear());
    } else {
      this.yearFilter.set(this.plantedRootPoolPlantedYears()[0]);
    }
  });


  filteredPlantedFieldsForYear: Signal<PlantedField[]> = computed(() => {
    if (this.plantedRootPools().length === 0) { return []; }

    return [
      ...new Set(
        this.plantedRootPools()
          .filter(plantedRootPool => Number(plantedRootPool.plantedYear) === this.yearFilter())
          .map(record => {
            return this.plantedFields().find(field => field.id === record.fieldId)!;
          })
          .filter(field => field.active)
          .sort((a, b) => a.field.localeCompare(b.field))
      )
    ]
  });

  buddingEntryTotalListRecords: Signal<BuddingEntryTotalListRecord[]> = computed(() => {
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
      if (!buddedRootPool) { return null; }
      
      const plantedRootPool = this.plantedRootPools().find(pool => pool.id === buddedRootPool!.plantedRootPoolId);
      if (!plantedRootPool) { return null; }

      return {
        buddedRootPoolEntry: entry,
        plantedRootPool: plantedRootPool,
        plantedFieldRecord: this.plantedFields().find(field => field.id === plantedRootPool!.fieldId)!,
        plantedTypeRecord: this.plantedTypes().find(type => type.id === plantedRootPool!.plantedTypeId)!,
        rootstockRecord: this.rootstocks().find(stock => stock.id === plantedRootPool!.rootstockId)!,
        supplierRecord: this.suppliers().find(supplier => supplier.id === plantedRootPool!.supplierId)!,
        buddedRootPool: buddedRootPool,
        varietyRecord: this.varieties().find(variety => variety.id === buddedRootPool!.varietyId)!,
        customerRecord: this.customers().find(customer => customer.id === entry.customerId) || null,
        budderEmployeeRecord: this.employees().find(employee => employee.id === entry.budderEmployeeId) || null,
      };
    }).filter(record => record !== null)
      .sort((a, b) => a.plantedFieldRecord.field.localeCompare(b.plantedFieldRecord.field))
  });

  filteredBuddingEntryTotalListRecords: Signal<BuddingEntryTotalListRecord[]> = computed(() => {
    if (this.buddingEntryTotalListRecords().length === 0) { return []; }

    return this.buddingEntryTotalListRecords()
      .filter(record => {
        if (!this.yearFilter()) { return false; }
        return Number(record.plantedRootPool.plantedYear) === this.yearFilter();
      })
      .filter(record => {
        if (!this.fieldFilter()) { return true; }
        return record.plantedFieldRecord.id === this.fieldFilter()!.id;
      })
      .filter(record => {
        if (this.globalSearchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());
      });
  });

  buddingEntryRows: Signal<number[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    
    return [
      ...new Set(this.filteredBuddingEntryTotalListRecords().map(record => record.plantedRootPool.row))
    ]
  });

  buddingEntryPlantings: Signal<PlantedRootPool[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    
    return [
      ...new Set(this.filteredBuddingEntryTotalListRecords().map(record => record.plantedRootPool))
    ]
  });

  buddingEntryPlantingsCompleted: Signal<PlantedRootPool[]> = computed(() => {
    if (this.buddingEntryPlantings().length === 0) { return []; }

    return this.buddingEntryPlantings().filter(planting => planting.buddingComplete);
  });

  buddingEntryDates: Signal<string[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    return [
      ...new Set(this.filteredBuddingEntryTotalListRecords().map(record => {
        return new Date(record.buddedRootPoolEntry.dateBudded).toDateString();
      }))
    ]
  });

  buddingEntryVarieties: Signal<Variety[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }

    return [
      ...new Set(this.filteredBuddingEntryTotalListRecords().map(record => record.varietyRecord))
    ]
  });

  buddingEntryRootstocks: Signal<Rootstock[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    
    return [
      ...new Set(this.filteredBuddingEntryTotalListRecords().map(record => record.rootstockRecord))
    ];
  });

  buddingEntryVarietyRootstockCombinations: Signal<{ variety: Variety, rootstock: Rootstock }[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }

    return this.filteredBuddingEntryTotalListRecords().flatMap(record => {
      return {
        variety: record.varietyRecord,
        rootstock: record.rootstockRecord
      };
    }).filter((value, index, self) => 
      index === self.findIndex(v => v.variety.id === value.variety.id && v.rootstock.id === value.rootstock.id)
    );
  });

  buddingEntryBudders: Signal<Employee[]> = computed(() =>{
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
      
    return [
      ...new Set(this.filteredBuddingEntryTotalListRecords()
        .map(record => {
          if (!record.budderEmployeeRecord) { return null; }
          return record.budderEmployeeRecord
        })
        .filter(budder => budder !== null) as Employee[])
    ];
  });

  // for totals by day
  buddedEntriesTotalsByDayRecords: Signal<TotalByDayListRecord[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    if (this.buddingEntryDates().length === 0) { return []; }

    return this.buddingEntryDates()
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => {
      
        const entriesForDate = this.filteredBuddingEntryTotalListRecords().filter(record => { 
          return new Date(record.buddedRootPoolEntry.dateBudded).toDateString() === date
        });
        const total = entriesForDate.reduce((sum, record) => sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0);
        
        return {
          date: date,
          totalBuddedQuantity: total,
          buddingEntries: entriesForDate
        };
      });
  });

  //totals by variety and rootstock
  buddedEntriesTotalsByVarietyAndRootstockRecords: Signal<TotalByVarietyAndRootstockListRecord[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    if (this.buddingEntryVarietyRootstockCombinations().length === 0) { return []; }
    
    return this.buddingEntryVarietyRootstockCombinations()
      .sort((a, b) => a.variety.name.localeCompare(b.variety.name))
      .sort((a, b) => a.rootstock.name.localeCompare(b.rootstock.name))
      .map(varietyPlusRootstock => {

        const entries = this.filteredBuddingEntryTotalListRecords().filter(record => {
          return record.varietyRecord.id === varietyPlusRootstock.variety.id && 
            record.rootstockRecord.id === varietyPlusRootstock.rootstock.id;
        });
      
        const total = entries.reduce((sum, record) => sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0);

        return {
          variety: varietyPlusRootstock.variety,
          rootstock: varietyPlusRootstock.rootstock,
          totalBuddedQuantity: total,
          buddingEntries: entries
        };
      });
  });

  //totals by budder
  buddedEntriesTotalsByBudderRecords: Signal<TotalByBudderListRecord[]> = computed(() => {
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }
    if (this.buddingEntryBudders().length === 0) { return []; }

    return this.buddingEntryBudders().map(budder => {
      
      const entries = this.filteredBuddingEntryTotalListRecords().filter(record => {
        if (!record.budderEmployeeRecord) { return null; }
        return record.budderEmployeeRecord.id === budder.id;
      }).filter(record => record !== null);
      
      const total = entries.reduce((sum, record) => 
        sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0
      );
      
      return {
        budder: budder,
        totalBuddedQuantity: total,
        buddingEntries: entries
      };
    });
  });

  // list completed rows by day
  completedRows: Signal<CompletedRow[]> = computed(() => { 
    if (this.buddingEntryRows().length === 0) { return []; }
    if (this.buddingEntryPlantings().length === 0) { return []; }
    if (this.filteredBuddingEntryTotalListRecords().length === 0) { return []; }

    return this.buddingEntryRows().map(row => {

      const plantings = this.buddingEntryPlantings().filter(planting => planting.row === row);
      const buddingEntries = this.filteredBuddingEntryTotalListRecords().filter(record => record.plantedRootPool.row === row);
      const dateCompleted = new Date(Math.max(...buddingEntries.map(entry => new Date(entry.buddedRootPoolEntry.dateBudded).getTime())));
      const total = buddingEntries.reduce((sum, record) => sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0);

      if (plantings.length === 0 || buddingEntries.length === 0) { return null; }

      return {
        row: row,
        plantings: plantings,
        buddingEntries: buddingEntries,
        dateCompleted: dateCompleted,
        totalBuddedQuantity: total
      };
    }).filter(row => row !== null) as CompletedRow[];
  });

  completedRowDates: Signal<string[]> = computed(() => {
    if (this.completedRows().length === 0) { return []; }
    return [
      ...new Set(this.completedRows()
      .map(row => row.dateCompleted.toDateString()))
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  });

  datesWithCompletedRows: Signal<DateWithCompletedRows[]> = computed(() => { 
    if (this.completedRowDates().length === 0) {return []; }

    return this.completedRowDates().map(date => {
      const completedRowsForDate = this.completedRows().filter(row => 
        row.dateCompleted.toDateString() === date
      );

      return {
        dateCompleted: date,
        totalBuddedQuantity: completedRowsForDate.reduce((sum, row) => sum + row.totalBuddedQuantity, 0),
        completedRows: completedRowsForDate
      };
    });
  });

  totalQuantityBudded: Signal<number> = computed(() => {
    return this.filteredBuddingEntryTotalListRecords().reduce((sum, record) => sum + (record.buddedRootPoolEntry.quantityBudded || 0), 0);
  });

  totalQuantityBuddedForCompletedRows: Signal<number> = computed(() => {
    return this.completedRows().reduce((sum, row) => sum + row.totalBuddedQuantity, 0);
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
    if (this.buddingEntryTotalListRecords().length === 0) { return; }
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
