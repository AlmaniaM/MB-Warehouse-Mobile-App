import { 
  Component, 
  computed, 
  inject, 
  input, 
  InputSignal, 
  Signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import {
  IonHeader,  
  IonToolbar, 
  IonTitle, 
  IonList,
  IonItem,
  IonLabel, 
  IonProgressBar, 
} from '@ionic/angular/standalone';

import { PlantedRootPool } from '../../services/planted-root-pool.service';
import { PlantedFieldService, PlantedField } from 'src/app/modules/sourcelists/services/planted-field.service';
import { PlantedTypeService, PlantedType } from 'src/app/modules/sourcelists/services/planted-type.service';
import { Supplier, SupplierService } from 'src/app/modules/sourcelists/services/supplier.service';
import { Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';

@Component({
  selector: 'app-planted-root-pool-form',
  templateUrl: './planted-root-pool-form.component.html',
  styleUrls: ['./planted-root-pool-form.component.scss'],
  imports: [
    FormsModule,
    DatePipe,
    IonLabel,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonList,
    IonItem,
    IonProgressBar, 
  ]
})
export class PlantedRootPoolFormComponent {

  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  supplierService: SupplierService = inject(SupplierService);
  rootstockService: RootstockService = inject(RootstockService);
  variertyService: VarietyService = inject(VarietyService);

  plantedFieldServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedFieldService.statusSubject, { requireSync: true });
  plantedTypeServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.plantedTypeService.statusSubject, { requireSync: true });
  supplierServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.supplierService.statusSubject, { requireSync: true });
  rootstockServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.rootstockService.statusSubject, { requireSync: true });
  varietyServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.variertyService.statusSubject, { requireSync: true });

  isFetchingData: Signal<boolean> = computed(() => {
    return [
      this.plantedFieldServiceStatus(),
      this.plantedTypeServiceStatus(),
      this.supplierServiceStatus(),
      this.rootstockServiceStatus(),
      this.varietyServiceStatus()
    ].some(status => ['fetching', 'creating', 'updating', 'deleting'].includes(status));
  });
  
  plantedFields: Signal<PlantedField[]> = toSignal(this.plantedFieldService.plantedFields, { initialValue: [] });
  plantedTypes: Signal<PlantedType[]> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: [] });
  suppliers: Signal<Supplier[]> = toSignal(this.supplierService.suppliers, { initialValue: [] });
  rootstocks: Signal<Rootstock[]> = toSignal(this.rootstockService.rootstocks, { initialValue: [] });
  varieties: Signal<Variety[]> = toSignal(this.variertyService.varieties, { initialValue: [] });

  formType: InputSignal<'view'> = input.required<'view'>();
  initialPlantedRootPool: InputSignal<PlantedRootPool | null> = input.required<PlantedRootPool | null>();
  
  plantedFieldForSelectedPlantedRootPool: Signal<PlantedField | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.plantedFields().find(field => field.id === this.initialPlantedRootPool()!.fieldId) || null;
  });

  plantedTypeForSelectedPlantedRootPool: Signal<PlantedType | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.plantedTypes().find(type => type.id === this.initialPlantedRootPool()!.plantedTypeId) || null;
  });

  supplierForSelectedPlantedRootPool: Signal<Supplier | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.suppliers().find(supplier => supplier.id === this.initialPlantedRootPool()!.supplierId) || null;
  });

  rootstockForSelectedPlantedRootPool: Signal<Rootstock | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.rootstocks().find(rootstock => rootstock.id === this.initialPlantedRootPool()!.rootstockId) || null;
  });

  varietyForSelectedPlantedRootPool: Signal<Variety | null> = computed(() => {
    if (!this.initialPlantedRootPool()) { return null; }
    return this.varieties().find(variety => variety.id === this.initialPlantedRootPool()!.plantedVarietyId) || null;
  });

}