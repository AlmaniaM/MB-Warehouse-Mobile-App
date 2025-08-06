import { 
  Component, 
  computed, 
  effect, 
  inject, 
  Signal, 
  InputSignal, 
  input, 
  signal,
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  IonFooter, 
  IonFab, 
  IonFabButton, 
  IonContent, 
  IonModal, 
  IonHeader, 
  IonButtons, 
  IonIcon, 
  IonButton,  
  IonToolbar, 
  IonTitle, 
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText, 
  IonProgressBar, 
  IonLabel, 
  IonDatetimeButton, 
  IonPopover, 
  IonDatetime,
  IonTextarea
} from '@ionic/angular/standalone';

import { SelectedBuddingEntryService } from '../../services/selected-budding-entry.service';
import { PlantedRootPool } from '../../services/planted-root-pool.service';
import { BuddedRootPool, BuddedRootPoolService, defaultBuddedRootPool } from '../../services/budded-root-pool.service';
import { BuddedRootPoolEntry, BuddedRootPoolEntryService, defaultBuddedRootPoolEntry } from '../../services/budded-root-pool-entry.service';
import { PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { Employee, EmployeeService } from 'src/app/modules/sourcelists/services/employee.service';
import { Customer, CustomerService } from 'src/app/modules/sourcelists/services/customer.service';

import { Utils } from 'src/app/modules/global/classes/utils';
import { CustomerSelectorComponent } from 'src/app/modules/sourcelists/components/customer-selector/customer-selector.component';
import { VarietySelectorComponent } from 'src/app/modules/sourcelists/components/variety-selector/variety-selector.component';
import { EmployeeSelectorComponent } from 'src/app/modules/sourcelists/components/employee-selector/employee-selector.component';

@Component({
  selector: 'app-budding-entry-form',
  templateUrl: './budding-entry-form.component.html',
  styleUrls: ['./budding-entry-form.component.scss'],
  imports: [
    FormsModule,
    IonDatetime, 
    IonPopover, 
    IonDatetimeButton, 
    IonLabel, 
    IonFooter, 
    IonFab, 
    IonFabButton, 
    IonContent, 
    IonModal, 
    IonHeader, 
    IonButtons, 
    IonIcon, 
    IonButton,  
    IonToolbar, 
    IonTitle, 
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonText,
    IonProgressBar,
    CustomerSelectorComponent,
    VarietySelectorComponent,
    EmployeeSelectorComponent
  ]
})
export class BuddingEntryFormComponent {

  selectedBuddingEntryService: SelectedBuddingEntryService = inject(SelectedBuddingEntryService);
  buddedRootPoolService: BuddedRootPoolService = inject(BuddedRootPoolService);
  buddedRootPoolEntryService: BuddedRootPoolEntryService = inject(BuddedRootPoolEntryService);
  varietySerive: VarietyService = inject(VarietyService);
  employeeService: EmployeeService = inject(EmployeeService);
  customerService: CustomerService = inject(CustomerService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);

  buddedRootPoolServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.buddedRootPoolService.previousDataOperationSubject, { requireSync: true });
  buddedRootPoolEntryServicePreviousDataOperation: Signal<'created' | 'updated' | 'deleted' | null> = toSignal(this.buddedRootPoolEntryService.previousDataOperationSubject, { requireSync: true });
  
  buddedRootPoolServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.buddedRootPoolService.statusSubject, { requireSync: true });
  buddedRootPoolEntryServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.buddedRootPoolEntryService.statusSubject, { requireSync: true });
  varietyServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.varietySerive.statusSubject, { requireSync: true });
  employeeServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.employeeService.statusSubject, { requireSync: true });
  customerServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.customerService.statusSubject, { requireSync: true });
  plantedFieldServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.plantedFieldService.statusSubject, { requireSync: true });
  plantedTypeServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.plantedTypeService.statusSubject, { requireSync: true });

  isFetchingData: Signal<boolean> = computed(() => {
    return [
      this.buddedRootPoolServiceStatus(),
      this.buddedRootPoolEntryServiceStatus(),
      this.varietyServiceStatus(),
      this.employeeServiceStatus(),
      this.customerServiceStatus(),
      this.plantedFieldServiceStatus(),
      this.plantedTypeServiceStatus()
    ].some(status => ['fetching', 'creating', 'updating', 'deleting'].includes(status));
  });

  buddedRootPools: Signal<BuddedRootPool[]> = toSignal(this.buddedRootPoolService.buddedRootPools, { initialValue: [] });
  varieties: Signal<Variety[]> = toSignal(this.varietySerive.varieties, { initialValue: [] });
  employees: Signal<Employee[]> = toSignal(this.employeeService.employees, { initialValue: [] });
  customers: Signal<Customer[]> = toSignal(this.customerService.customers, { initialValue: [] });
  plantedFields: Signal<PlantedField[]> = toSignal(this.plantedFieldService.plantedFields, { initialValue: [] });
  plantedTypes: Signal<PlantedType[]> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: [] });
  
  sortedVarieties: Signal<Variety[]> = computed(() => {
    return this.varieties()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(variety => variety.active);
  });
  sortedEmployees: Signal<Employee[]> = computed(() => {
    return this.employees()
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
      .filter(variety => variety.active);
  });
  sortedCustomers: Signal<Customer[]> = computed(() => {
    return this.customers()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(variety => variety.active);
  });

  formType: InputSignal<'new' | 'update' | 'view'> = input.required<'new' | 'update' | 'view'>();
  initialPlantedRootPool: InputSignal<PlantedRootPool> = input.required<PlantedRootPool>();
  initialBuddedRootPool: InputSignal<BuddedRootPool | null> = input.required<BuddedRootPool | null>();
  initialBuddedRootPoolEntry: InputSignal<BuddedRootPoolEntry | null> = input.required<BuddedRootPoolEntry | null>();

  plantedFieldForInitialPlantedRootPool: Signal<PlantedField | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.plantedFields().find(field => field.id === this.initialPlantedRootPool()!.fieldId) || null;
  });

  plantedTypeForInitialPlantedRootPool: Signal<PlantedType | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.plantedTypes().find(type => type.id === this.initialPlantedRootPool()!.plantedTypeId) || null;
  });

  initialBuddedRootPoolEffect = effect(() => {
    if (this.varieties().length === 0) { return; }
    if (!this.initialBuddedRootPool()) { return; }
    
    this.buddedVariety.set(this.varieties().find(variety => variety.id === this.initialBuddedRootPool()!.varietyId) || null);
  });

  initialBuddedRootPoolEntryEffect = effect(() => {
    if (this.formType() === 'new') { 
      this.isEditing.set(true);      
      return; 
    }
    if (this.employees().length === 0) { return; }
    if (this.customers().length === 0) { return; }
    if (!this.initialBuddedRootPoolEntry()) { return; }

    this.budder.set(this.employees().find(e => e.id === this.initialBuddedRootPoolEntry()!.budderEmployeeId) || null);
    this.quantityBudded.set(this.initialBuddedRootPoolEntry()!.quantityBudded);
    this.dateBudded.set(new Date(this.initialBuddedRootPoolEntry()!.dateBudded));
    this.customer.set(this.customers().find(c => c.id === this.initialBuddedRootPoolEntry()!.customerId) || null);
  });

  buddedVariety: WritableSignal<Variety | null> = signal<Variety | null>(null);
  budder: WritableSignal<Employee | null> = signal<Employee | null>(null);
  quantityBudded: WritableSignal<number> = signal<number>(0);
  dateBudded: WritableSignal<Date> = signal<Date>(new Date());
  dateBuddedIso: Signal<string> = computed<string>(() => this.dateBudded() ? Utils.adjustToLocalTime(this.dateBudded()!).toISOString() : '');
  customer: WritableSignal<Customer | null> = signal<Customer | null>(null);
  notes: WritableSignal<string | null> = signal<string | null>(null);

  dateChanged(event: CustomEvent) {
    this.dateBudded.set(new Date(event.detail.value!));
  }

  buddedRootPoolForSelectedBuddedVariety: Signal<BuddedRootPool | null> = computed(() => { 
    if (!this.initialPlantedRootPool()) { return null; }
    if (!this.buddedVariety()) { return null; }

    return this.buddedRootPools().find(buddedRootPool=> {
      return buddedRootPool.plantedRootPoolId === this.initialPlantedRootPool()!.id && buddedRootPool.varietyId === this.buddedVariety()!.id;
    }) || null;
  });

  buddedRootPoolToCreate: Signal<BuddedRootPool | null> = computed(() => { 
    if (!this.initialPlantedRootPool()) { return null; }
    if (!this.buddedVariety()) { return null; }
    if (this.buddedRootPoolForSelectedBuddedVariety()) { return null; }

    return {
      ...defaultBuddedRootPool,
      plantedRootPoolId: this.initialPlantedRootPool()!.id,
      varietyId: this.buddedVariety()!.id,
    }
  });

  updatedBuddedRootPoolEntry: Signal<BuddedRootPoolEntry> = computed(() => {
    return {
      ...this.formType() === 'new' ? defaultBuddedRootPoolEntry : this.initialBuddedRootPoolEntry()!,
      buddedRootPoolId: this.buddedRootPoolForSelectedBuddedVariety() ? this.buddedRootPoolForSelectedBuddedVariety()!.id : this.buddedRootPoolToCreate()!.id,
      budderEmployeeId: this.budder() ? this.budder()!.id : null,
      customerId: this.customer() ? this.customer()!.id : null,
      notes: this.notes(),
      dateBudded: this.dateBudded(),
      quantityBudded: this.quantityBudded(),
    };
  });

  updatedBuddedRootPoolEntryIsValid: Signal<boolean> = computed(() => { 
    if (!this.buddedVariety()) { return false; }
    if (this.quantityBudded() <= 0) { return false; }
    if (!this.dateBudded()) { return false; }

    return true;
  });

  updatedBuddedRootPoolEntryIsValidEffect = effect(() => { 
    if (this.formType() === 'view') { return; }
    if (!this.updatedBuddedRootPoolEntryIsValid()) { return; }
    this.validBuddedRootPoolEntryToSave.set(this.updatedBuddedRootPoolEntry());
  });

  validBuddedRootPoolEntryToSave: WritableSignal<BuddedRootPoolEntry | null> = signal<BuddedRootPoolEntry | null>(null);
  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isDeleting: WritableSignal<boolean> = signal<boolean>(false);
  isCreating: WritableSignal<boolean> = signal<boolean>(false);

  createBuddedRootPool() {
    if (!this.buddedRootPoolToCreate()) { return; }
    this.buddedRootPoolService.createBuddedRootPools([this.buddedRootPoolToCreate()!]);
  }

  deleteBuddedRootPool() {
    if (!this.buddedRootPoolForSelectedBuddedVariety()) { return; }
    this.buddedRootPoolService.deleteBuddedRootPools([this.buddedRootPoolForSelectedBuddedVariety()!]);
  }
  
  justCreatedBuddedRootPoolEffect = effect(() => {
    if (this.buddedRootPoolServicePreviousDataOperation() !== 'created') { return; }
    if (this.buddedRootPoolEntryServiceStatus() !== 'stable') { return; }
    if (!this.buddedRootPoolForSelectedBuddedVariety()) { return; }
    if (!this.validBuddedRootPoolEntryToSave()) { return; }
    if (!this.isCreating()) { return; }

    this.isCreating.set(false);
    this.createBuddedRootPoolEntry();
  });

  createBuddedRootPoolEntry() {
    this.isCreating.set(true);
    if (this.buddedRootPoolToCreate()) { 
      this.createBuddedRootPool();
      return;
    }
    if (!this.validBuddedRootPoolEntryToSave()) { return; }
    this.buddedRootPoolEntryService.createBuddedRootPoolEntries([this.validBuddedRootPoolEntryToSave()!]);
    this.resetForm();
  }

  updateBuddedRootPoolEntry() { 
    if (!this.validBuddedRootPoolEntryToSave()) { return; }
    this.buddedRootPoolEntryService.updateBuddedRootPoolEntries([this.validBuddedRootPoolEntryToSave()!]);
  }

  justUpdatedBuddedRootPoolEntryEffect = effect(() => {
    if (this.formType() === 'new') { return; }
    if (this.buddedRootPoolEntryServicePreviousDataOperation() !== 'updated') { return; }
    if (this.buddedRootPoolEntryServiceStatus() !== 'stable') { return; }
    this.isEditing.set(false);
  });

  deleteBuddedRootPoolEntry() {
    if (!this.initialBuddedRootPoolEntry()) { return; }
    this.buddedRootPoolEntryService.deleteBuddedRootPoolEntries([this.initialBuddedRootPoolEntry()!]);
  }

  resetForm() { 

    this.buddedVariety.set(null);
    this.budder.set(null);
    this.quantityBudded.set(0);
    this.dateBudded.set(new Date());
    this.customer.set(null);
    this.notes.set(null);

    if (this.initialBuddedRootPool()) {
      this.buddedVariety.set(this.varieties().find(variety => variety.id === this.initialBuddedRootPool()!.varietyId) || null);
    }
    if (!this.initialBuddedRootPoolEntry()) { return; }

    this.budder.set(this.employees().find(e => e.id === this.initialBuddedRootPoolEntry()!.budderEmployeeId) || null);
    this.quantityBudded.set(this.initialBuddedRootPoolEntry()!.quantityBudded);
    this.dateBudded.set(new Date(this.initialBuddedRootPoolEntry()!.dateBudded));
    this.customer.set(this.customers().find(c => c.id === this.initialBuddedRootPoolEntry()!.customerId) || null);
    this.notes.set(this.initialBuddedRootPoolEntry()!.notes);
  }
}
