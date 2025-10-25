import { 
  Component, 
  computed, 
  effect, 
  inject, 
  Signal, 
  InputSignal, 
  input, 
  signal,
  WritableSignal,
  output
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  IonList,
  IonItem,
  IonInput,
  IonTitle, 
  IonToolbar, 
  IonIcon, 
  IonHeader, 
  IonFab, 
  IonFabButton,
  IonProgressBar, 
  IonLabel, 
  IonToggle,
  IonButton,
  IonButtons,
  IonModal,
  IonContent,
  IonText,
  IonFooter
} from '@ionic/angular/standalone';

import { ShippingSheetContent, ShippingSheetDetailService, createDefaultShippingSheetDetail } from 'src/app/modules/shipping/services/shipping-sheet-detail.service';
import { SelectedShippingSheetService } from 'src/app/modules/shipping/services/selected-shipping-sheet.service';
import { ShippingSheet } from 'src/app/modules/shipping/services/shipping-sheet.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSize, DigTreeSizeService } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { ContainerType, ContainerTypeService } from 'src/app/modules/sourcelists/services/container-type.service';
import { VarietySelectorComponent } from 'src/app/modules/sourcelists/components/variety-selector/variety-selector.component';
import { RootstockSelectorComponent } from 'src/app/modules/sourcelists/components/rootstock-selector/rootstock-selector.component';
import { PlantedTypeSelectorComponent } from 'src/app/modules/sourcelists/components/planted-type-selector/planted-type-selector.component';
import { PlantedFieldSelectorComponent } from 'src/app/modules/sourcelists/components/planted-field-selector/planted-field-selector.component';
import { DigTreeSizeSelectorComponent } from 'src/app/modules/sourcelists/components/dig-tree-size-selector/dig-tree-size-selector.component';
import { ContainerTypeSelectorComponent } from 'src/app/modules/sourcelists/components/container-type-selector/container-type-selector.component';

@Component({
  selector: 'app-shipping-sheet-content-form',
  templateUrl: './shipping-sheet-content-form.component.html',
  styleUrls: ['./shipping-sheet-content-form.component.scss'],
  imports: [
    FormsModule,
    IonToggle,
    IonLabel, 
    IonFab, 
    IonFabButton, 
    IonHeader, 
    IonIcon,  
    IonToolbar, 
    IonTitle, 
    IonList,
    IonItem,
    IonInput,
    IonProgressBar,
    IonButton,
    IonButtons,
    IonModal,
    IonContent,
    IonText,
    IonFooter,
    VarietySelectorComponent,
    RootstockSelectorComponent,
    PlantedTypeSelectorComponent,
    PlantedFieldSelectorComponent,
    DigTreeSizeSelectorComponent,
    ContainerTypeSelectorComponent
  ]
})
export class ShippingSheetContentFormComponent {
  
  private readonly defaultShippingSheetDetail: ShippingSheetContent = createDefaultShippingSheetDetail();
  
  shippingSheetDetailService: ShippingSheetDetailService = inject(ShippingSheetDetailService);
  selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
  varietyService: VarietyService = inject(VarietyService);
  rootstockService: RootstockService = inject(RootstockService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);

  shippingSheetDetailServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.shippingSheetDetailService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.shippingSheetDetailServiceStatus());
  });

  formType: InputSignal<'new' | 'view' | 'update'> = input.required<'new' | 'view' | 'update'>();
  initialShippingSheetDetail: InputSignal<ShippingSheetContent | null> = input.required<ShippingSheetContent | null>();
  selectedShippingSheet: InputSignal<ShippingSheet | null> = input<ShippingSheet | null>(null);
  
  initialShippingSheetDetailEffect = effect(() => {
    if (this.formType() === 'new') { 
      this.isEditing.set(true);
      this.resetForm();
      return; 
    }

    if (this.formType() === 'update') { 
      this.isEditing.set(false);      
    }

    if (this.formType() === 'view') { 
      this.isEditing.set(false);      
    }

    if (!this.initialShippingSheetDetail()) { return; }

    this.varietyId.set(this.initialShippingSheetDetail()!.varietyId || 0);
    this.rootstockId.set(this.initialShippingSheetDetail()!.rootstockId || 0);
    this.plantedTypeId.set(this.initialShippingSheetDetail()!.plantedTypeId || 0);
    this.fieldId.set(this.initialShippingSheetDetail()!.sourceFieldId || 0);
    this.quantity.set(this.initialShippingSheetDetail()!.quantity || 0);
    this.note.set(this.initialShippingSheetDetail()!.note || '');
    this.digTreeSizeId.set(this.initialShippingSheetDetail()!.digTreeSizeId || 0);
    this.containerTypeId.set(this.initialShippingSheetDetail()!.containerTypeId || 0);
    this.palletNumber.set(this.initialShippingSheetDetail()!.palletNumber);
    this.ranch.set(this.initialShippingSheetDetail()!.ranch || '');
  });

  varietyId: WritableSignal<number> = signal<number>(0);
  rootstockId: WritableSignal<number> = signal<number>(0);
  plantedTypeId: WritableSignal<number> = signal<number>(0);
  fieldId: WritableSignal<number> = signal<number>(0);
  quantity: WritableSignal<number> = signal<number>(0);
  note: WritableSignal<string> = signal<string>('');
  digTreeSizeId: WritableSignal<number> = signal<number>(0);
  containerTypeId: WritableSignal<number> = signal<number>(0);
  palletNumber: WritableSignal<number | null> = signal<number | null>(null);
  ranch: WritableSignal<string> = signal<string>('');

  varieties: Signal<Variety[] | null> = toSignal(this.varietyService.varieties, { initialValue: null });
  rootstocks: Signal<Rootstock[] | null> = toSignal(this.rootstockService.rootstocks, { initialValue: null });
  plantedTypes: Signal<PlantedType[] | null> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: null });
  plantedFields: Signal<PlantedField[] | null> = toSignal(this.plantedFieldService.plantedFields, { initialValue: null });
  digTreeSizes: Signal<DigTreeSize[] | null> = toSignal(this.digTreeSizeService.digTreeSizes, { initialValue: null });
  containerTypes: Signal<ContainerType[] | null> = toSignal(this.containerTypeService.containerTypes, { initialValue: null });

  activeVarieties: Signal<Variety[]> = computed(() => {
    const varieties = this.varieties();
    return varieties ? varieties.filter(v => v.active) : [];
  });

  activeRootstocks: Signal<Rootstock[]> = computed(() => {
    const rootstocks = this.rootstocks();
    return rootstocks ? rootstocks.filter(r => r.active) : [];
  });

  activePlantedTypes: Signal<PlantedType[]> = computed(() => {
    const plantedTypes = this.plantedTypes();
    return plantedTypes ? plantedTypes.filter(p => p.active) : [];
  });

  activePlantedFields: Signal<PlantedField[]> = computed(() => {
    const plantedFields = this.plantedFields();
    return plantedFields ? plantedFields.filter(f => f.active) : [];
  });

  activeDigTreeSizes: Signal<DigTreeSize[]> = computed(() => {
    const digTreeSizes = this.digTreeSizes();
    return digTreeSizes ? digTreeSizes.filter(d => d.active) : [];
  });

  activeContainerTypes: Signal<ContainerType[]> = computed(() => {
    const containerTypes = this.containerTypes();
    return containerTypes ? containerTypes.filter(c => c.active) : [];
  });

  updatedShippingSheetDetailIsValid: Signal<boolean> = computed(() => { 
    if (this.varietyId() <= 0) { return false; }
    if (this.rootstockId() <= 0) { return false; }
    if (this.plantedTypeId() <= 0) { return false; }
    if (this.fieldId() <= 0) { return false; }
    if (this.quantity() <= 0) { return false; }
    if (this.digTreeSizeId() <= 0) { return false; }
    if (this.containerTypeId() <= 0) { return false; }
    return true;
  });

  formTitle: Signal<string> = computed(() => {
    const formType = this.formType();
    const isEditing = this.isEditing();
    
    switch (formType) {
      case 'new':
        return 'Add Shipping Sheet Content';
      case 'view':
        return isEditing ? 'Edit Shipping Sheet Content' : 'View Shipping Sheet Content';
      case 'update':
        return 'Edit Shipping Sheet Content';
      default:
        return 'Shipping Sheet Content';
    }
  });


  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isDeleting: WritableSignal<boolean> = signal<boolean>(false);
  isVarietySelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isRootstockSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isPlantedTypeSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isFieldSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isDigTreeSizeSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isContainerTypeSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);

  formSubmit = output<void>();
  formUpdate = output<void>();
  formDelete = output<void>();
  
  createShippingSheetDetail() {
    if (!this.updatedShippingSheetDetailIsValid()) { return; }
    
    const selectedShippingSheet = this.selectedShippingSheet();
    const shippingSheetDetail: ShippingSheetContent = {
      ...this.defaultShippingSheetDetail,
      shipmentNum: selectedShippingSheet?.shipmentNum || 0,
      shipmentYear: selectedShippingSheet?.shipmentYear || '',
      varietyId: this.varietyId(),
      rootstockId: this.rootstockId(),
      plantedTypeId: this.plantedTypeId(),
      sourceFieldId: this.fieldId(),
      quantity: this.quantity(),
      note: this.note(),
      digTreeSizeId: this.digTreeSizeId(),
      containerTypeId: this.containerTypeId(),
      palletNumber: this.palletNumber(),
      ranch: this.ranch(),
    };
    
    this.shippingSheetDetailService.createShippingSheetDetail(shippingSheetDetail);
    this.resetForm();
    this.formSubmit.emit();
  }

  resetForm() { 
    this.varietyId.set(0);
    this.rootstockId.set(0);
    this.plantedTypeId.set(0);
    this.fieldId.set(0);
    this.quantity.set(0);
    this.note.set('');
    this.digTreeSizeId.set(0);
    this.containerTypeId.set(0);
    this.palletNumber.set(null);
    this.ranch.set('');
  }

  updateShippingSheetDetail() {
    if (!this.updatedShippingSheetDetailIsValid()) { 
      return; 
    }
    
    const selectedShippingSheet = this.selectedShippingSheet();
    const shippingSheetDetail: ShippingSheetContent = {
      ...this.initialShippingSheetDetail()!,
      shipmentNum: selectedShippingSheet?.shipmentNum || 0,
      shipmentYear: selectedShippingSheet?.shipmentYear || '',
      varietyId: this.varietyId(),
      rootstockId: this.rootstockId(),
      plantedTypeId: this.plantedTypeId(),
      sourceFieldId: this.fieldId(),
      quantity: this.quantity(),
      note: this.note(),
      digTreeSizeId: this.digTreeSizeId(),
      containerTypeId: this.containerTypeId(),
      palletNumber: this.palletNumber(),
      ranch: this.ranch(),
    };
    
    this.shippingSheetDetailService.updateShippingSheetDetail(shippingSheetDetail);
    this.isEditing.set(false);
    this.formUpdate.emit();
  }

  deleteShippingSheetDetail() {
    if (!this.initialShippingSheetDetail()) { return; }
    this.shippingSheetDetailService.deleteShippingSheetDetail(this.initialShippingSheetDetail()!.id);
    this.formDelete.emit();
  }

  constructor() {
    this.varietyService.getVarieties();
    this.rootstockService.getRootstocks();
    this.plantedTypeService.getPlantedTypes();
    this.plantedFieldService.getPlantedFields();
    this.digTreeSizeService.getDigTreeSizes();
    this.containerTypeService.getContainerTypes();
  }

  openVarietySelector() {
    this.isVarietySelectorOpen.set(true);
  }

  openRootstockSelector() {
    this.isRootstockSelectorOpen.set(true);
  }

  openPlantedTypeSelector() {
    this.isPlantedTypeSelectorOpen.set(true);
  }

  openFieldSelector() {
    this.isFieldSelectorOpen.set(true);
  }

  openDigTreeSizeSelector() {
    this.isDigTreeSizeSelectorOpen.set(true);
  }

  openContainerTypeSelector() {
    this.isContainerTypeSelectorOpen.set(true);
  }

  onVarietySelected(varieties: Variety[]) {
    if (varieties.length > 0) {
      this.varietyId.set(varieties[0].id);
    }
    this.isVarietySelectorOpen.set(false);
  }

  onRootstockSelected(rootstocks: Rootstock[]) {
    if (rootstocks.length > 0) {
      this.rootstockId.set(rootstocks[0].id);
    }
    this.isRootstockSelectorOpen.set(false);
  }

  onPlantedTypeSelected(plantedTypes: PlantedType[]) {
    if (plantedTypes.length > 0) {
      this.plantedTypeId.set(plantedTypes[0].id);
    }
    this.isPlantedTypeSelectorOpen.set(false);
  }

  onFieldSelected(fields: PlantedField[]) {
    if (fields.length > 0) {
      this.fieldId.set(fields[0].id);
    }
    this.isFieldSelectorOpen.set(false);
  }

  onDigTreeSizeSelected(digTreeSizes: DigTreeSize[]) {
    if (digTreeSizes.length > 0) {
      this.digTreeSizeId.set(digTreeSizes[0].id);
    }
    this.isDigTreeSizeSelectorOpen.set(false);
  }

  onContainerTypeSelected(containerTypes: ContainerType[]) {
    if (containerTypes.length > 0) {
      this.containerTypeId.set(containerTypes[0].id);
    }
    this.isContainerTypeSelectorOpen.set(false);
  }

  getSelectedVarietyName(): string | null {
    const varieties = this.activeVarieties();
    const selectedVariety = varieties.find(v => v.id === this.varietyId());
    return selectedVariety?.name || null;
  }

  getSelectedRootstockName(): string | null {
    const rootstocks = this.activeRootstocks();
    const selectedRootstock = rootstocks.find(r => r.id === this.rootstockId());
    return selectedRootstock?.name || null;
  }

  getSelectedPlantedTypeName(): string | null {
    const plantedTypes = this.activePlantedTypes();
    const selectedPlantedType = plantedTypes.find(p => p.id === this.plantedTypeId());
    return selectedPlantedType?.['type'] || null;
  }

  getSelectedFieldName(): string | null {
    const fields = this.activePlantedFields();
    const selectedField = fields.find(f => f.id === this.fieldId());
    return selectedField?.['field'] || null;
  }

  getSelectedDigTreeSizeName(): string | null {
    const digTreeSizes = this.activeDigTreeSizes();
    const selectedDigTreeSize = digTreeSizes.find(d => d.id === this.digTreeSizeId());
    return selectedDigTreeSize?.size || null;
  }

  getSelectedContainerTypeName(): string | null {
    const containerTypes = this.activeContainerTypes();
    const selectedContainerType = containerTypes.find(c => c.id === this.containerTypeId());
    return selectedContainerType?.['type'] || null;
  }
}
