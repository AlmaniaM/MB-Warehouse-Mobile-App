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
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonHeader,
  IonFab, 
  IonFabButton, 
  IonProgressBar,
  IonText, 
  IonNote,
  IonToolbar, 
  IonTitle,
  IonChip,
  IonFooter,
  IonButtons,
  IonButton,
  IonModal,
} from "@ionic/angular/standalone";

import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';
import { PlantedRootPool, PlantedRootPoolService } from '../../services/planted-root-pool.service';
import { BuddedRootPool, BuddedRootPoolService } from '../../services/budded-root-pool.service';
import { BuddedRootPoolEntry, BuddedRootPoolEntryService } from '../../services/budded-root-pool-entry.service';
import { PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { Employee, EmployeeService } from 'src/app/modules/sourcelists/services/employee.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';

import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { BuddingEntryFormComponent } from '../../components/budding-entry-form/budding-entry-form.component';

export interface BuddedRootPoolEntryListRecord {
  buddedRootPool: BuddedRootPool;
  buddedRootPoolEntry: BuddedRootPoolEntry;
  buddedVariety: Variety | null;
  budder: Employee | null;
  customer: Customer | null;
}

@Component({
  selector: 'app-budding-entries',
  templateUrl: './budding-entries.page.html',
  styleUrls: ['./budding-entries.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    IonContent,
    IonTitle, 
    IonHeader, 
    IonList,
    IonItem, 
    IonIcon, 
    IonToolbar, 
    IonLabel,
    IonFab, 
    IonFabButton, 
    IonProgressBar,
    IonText, 
    IonNote,  
    IonChip,
    IonFooter,
    IonButtons,
    IonButton,
    IonModal,
    PageTopbarComponent,
    ContentTopbarComponent,
    BuddingEntryFormComponent
  ]
})
export class BuddingEntriesPage { 
  
  selectedPlantedRootPoolService: SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);
  buddedRootPoolService: BuddedRootPoolService = inject(BuddedRootPoolService);
  buddedRootPoolEntryService: BuddedRootPoolEntryService = inject(BuddedRootPoolEntryService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  varietyService: VarietyService = inject(VarietyService);
  employeeService: EmployeeService = inject(EmployeeService);
  customerService: CustomerService = inject(CustomerService);

  buddedRootPoolServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>  = toSignal(this.buddedRootPoolService.statusSubject, { requireSync: true });
  buddedRootPoolEntryServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.buddedRootPoolEntryService.statusSubject, { requireSync: true });
  plantedFieldServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedFieldService.statusSubject, { requireSync: true });
  plantedTypeServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedTypeService.statusSubject, { requireSync: true });
  varietyServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.varietyService.statusSubject, { requireSync: true });
  employeeServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.employeeService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });

  isFetchingData: Signal<boolean> = computed(() => {
    return [
      this.buddedRootPoolServiceStatus(),
      this.buddedRootPoolEntryServiceStatus(),
      this.plantedFieldServiceStatus(),
      this.plantedTypeServiceStatus(),
      this.varietyServiceStatus(),
      this.employeeServiceStatus(),
      this.customerServiceStatus(),
    ].some(status => ['fetching', 'creating', 'updating', 'deleting'].includes(status));
  });

  selectedPlantedRootPool: Signal<PlantedRootPool | null> = toSignal(this.selectedPlantedRootPoolService.selectedPlantedRootPool, { initialValue: null });
  buddedRootPools: Signal<BuddedRootPool[]> = toSignal(this.buddedRootPoolService.buddedRootPools, { initialValue: [] });
  buddedRootPoolEntries: Signal<BuddedRootPoolEntry[]> = toSignal(this.buddedRootPoolEntryService.buddedRootPoolEntries, { initialValue: [] });
  plantedFields: Signal<PlantedField[]> = toSignal(this.plantedFieldService.plantedFields, { initialValue: [] });
  plantedTypes: Signal<PlantedType[]> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: [] });
  varieties: Signal<Variety[]> = toSignal(this.varietyService.varieties, { initialValue: [] });
  employees: Signal<Employee[]> = toSignal(this.employeeService.employees, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });

  plantedFieldForSelectedPlantedRootPool: Signal<PlantedField | null> = computed(() => {
    if (!this.selectedPlantedRootPool()) { return null; }
    return this.plantedFields().find(field => field.id === this.selectedPlantedRootPool()!.fieldId) || null;
  });

  plantedTypeForSelectedPlantedRootPool: Signal<PlantedType | null> = computed(() => {
    if (!this.selectedPlantedRootPool()) { return null; }
    return this.plantedTypes().find(type => type.id === this.selectedPlantedRootPool()!.plantedTypeId) || null;
  });

  buddedRootPoolsForPlantedRootPool: Signal<BuddedRootPool[]> = computed(() => { 
    if (!this.selectedPlantedRootPool()) { return []; }
    if (this.buddedRootPools().length === 0) { return []; }

    return this.buddedRootPools().filter(entry => entry.plantedRootPoolId === this.selectedPlantedRootPool()!.id);
  });

  buddingEntriesForPlantedRootPool: Signal<BuddedRootPoolEntryListRecord[]> = computed(() => { 
    if (this.buddedRootPoolsForPlantedRootPool().length === 0) { return []; }
    if (this.buddedRootPoolEntries().length === 0) { return []; }
    if (this.plantedTypes().length === 0) { return []; }
    if (this.varieties().length === 0) { return []; }
    if (this.employees().length === 0) { return []; }
    if (this.customers().length === 0) { return []; }
 
    return this.buddedRootPoolEntries().map(entry => {
      
      const buddedRootPool = this.buddedRootPoolsForPlantedRootPool().find(pool => pool.id === entry.buddedRootPoolId);
      if (!buddedRootPool) { return null; }

      return {
        buddedRootPool,
        buddedRootPoolEntry: entry,
        buddedVariety: this.varieties().find(variety => variety.id === buddedRootPool.varietyId)!,
        budder: this.employees().find(employee => employee.id === entry.budderEmployeeId) || null,
        customer: this.customers().find(customer => customer.id === entry.customerId) || null
      };
    }).filter(record => record !== null) as BuddedRootPoolEntryListRecord[];
  });

  totalBudded: Signal<number> = computed(() => {
    return this.buddingEntriesForPlantedRootPool().reduce((total, record) => {
      return total + (record.buddedRootPoolEntry.quantityBudded || 0);
    }, 0);
  });
  
  isCreatingBuddingEntry: WritableSignal<boolean> = signal(false);

}
