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

import { PalletContent, PalletContentsService, createDefaultPalletContents } from 'src/app/modules/digging/services/pallet-contents.service';
import { SelectedPalletService } from 'src/app/modules/digging/services/selected-pallet.service';
import { SelectedPalletContentsService } from 'src/app/modules/digging/services/selected-pallet-contents.service';
import { Variety, VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { Rootstock, RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedType, PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedField, PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSize, DigTreeSizeService } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { VarietySelectorComponent } from 'src/app/modules/sourcelists/components/variety-selector/variety-selector.component';
import { RootstockSelectorComponent } from 'src/app/modules/sourcelists/components/rootstock-selector/rootstock-selector.component';
import { PlantedTypeSelectorComponent } from 'src/app/modules/sourcelists/components/planted-type-selector/planted-type-selector.component';
import { PlantedFieldSelectorComponent } from 'src/app/modules/sourcelists/components/planted-field-selector/planted-field-selector.component';
import { DigTreeSizeSelectorComponent } from 'src/app/modules/sourcelists/components/dig-tree-size-selector/dig-tree-size-selector.component';

@Component({
  selector: 'app-pallet-contents-form',
  templateUrl: './pallet-contents-form.component.html',
  styleUrls: ['./pallet-contents-form.component.scss'],
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
    DigTreeSizeSelectorComponent
  ]
})
export class PalletContentsFormComponent {
  
  private readonly defaultPalletContents: PalletContent = createDefaultPalletContents();
  
  palletContentsService: PalletContentsService = inject(PalletContentsService);
  selectedPalletService: SelectedPalletService = inject(SelectedPalletService);
  varietyService: VarietyService = inject(VarietyService);
  rootstockService: RootstockService = inject(RootstockService);
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);

  palletContentsServiceStatus: Signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = toSignal(this.palletContentsService.statusSubject, { requireSync: true });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating', 'updating', 'deleting'].includes(this.palletContentsServiceStatus());
  });

  formType: InputSignal<'new' | 'view' | 'update'> = input.required<'new' | 'view' | 'update'>();
  initialPalletContent: InputSignal<PalletContent | null> = input.required<PalletContent | null>();
  
  initialPalletContentEffect = effect(() => {
    if (this.formType() === 'new') { 
      this.isEditing.set(true);      
      return; 
    }

    if (this.formType() === 'update') { 
      this.isEditing.set(false);      
    }

    if (this.formType() === 'view') { 
      this.isEditing.set(false);      
    }

    if (!this.initialPalletContent()) { return; }

    this.varietyId.set(this.initialPalletContent()!.varietyId);
    this.rootstockId.set(this.initialPalletContent()!.rootstockId);
    this.plantedTypeId.set(this.initialPalletContent()!.plantedTypeId);
    this.fieldId.set(this.initialPalletContent()!.fieldId);
    this.quantity.set(this.initialPalletContent()!.quantity);
    this.note.set(this.initialPalletContent()!.note || '');
    this.digTreeSizeId.set(this.initialPalletContent()!.digTreeSizeId);
    this.isReceivedWarehouse.set(this.initialPalletContent()!.isReceivedWarehouse || false);
  });

  varietyId: WritableSignal<number> = signal<number>(-1);
  rootstockId: WritableSignal<number> = signal<number>(-1);
  plantedTypeId: WritableSignal<number> = signal<number>(-1);
  fieldId: WritableSignal<number> = signal<number>(-1);
  quantity: WritableSignal<number> = signal<number>(0);
  note: WritableSignal<string> = signal<string>('');
  digTreeSizeId: WritableSignal<number> = signal<number>(-1);
  isReceivedWarehouse: WritableSignal<boolean> = signal<boolean>(false);

  varieties: Signal<Variety[] | null> = toSignal(this.varietyService.varieties, { initialValue: null });
  rootstocks: Signal<Rootstock[] | null> = toSignal(this.rootstockService.rootstocks, { initialValue: null });
  plantedTypes: Signal<PlantedType[] | null> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: null });
  plantedFields: Signal<PlantedField[] | null> = toSignal(this.plantedFieldService.plantedFields, { initialValue: null });
  digTreeSizes: Signal<DigTreeSize[] | null> = toSignal(this.digTreeSizeService.digTreeSizes, { initialValue: null });

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

  updatedPalletContentIsValid: Signal<boolean> = computed(() => { 
    if (this.varietyId() === -1) { return false; }
    if (this.rootstockId() === -1) { return false; }
    if (this.plantedTypeId() === -1) { return false; }
    if (this.fieldId() === -1) { return false; }
    if (this.quantity() <= 0) { return false; }
    if (this.digTreeSizeId() === -1) { return false; }
    return true;
  });

  formTitle: Signal<string> = computed(() => {
    const formType = this.formType();
    const isEditing = this.isEditing();
    
    switch (formType) {
      case 'new':
        return 'Add Pallet Contents';
      case 'view':
        return isEditing ? 'Edit Pallet Contents' : 'View Pallet Contents';
      case 'update':
        return 'Edit Pallet Contents';
      default:
        return 'Pallet Contents';
    }
  });

  updatedPalletContent: Signal<PalletContent | null> = computed(() => {
    if (!this.updatedPalletContentIsValid() || !this.initialPalletContent()) { return null; }
    
    return {
      ...this.initialPalletContent()!,
      varietyId: this.varietyId(),
      rootstockId: this.rootstockId(),
      plantedTypeId: this.plantedTypeId(),
      fieldId: this.fieldId(),
      quantity: this.quantity(),
      note: this.note(),
      digTreeSizeId: this.digTreeSizeId(),
      isReceivedWarehouse: this.isReceivedWarehouse()
    };
  });

  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isDeleting: WritableSignal<boolean> = signal<boolean>(false);
  isVarietySelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isRootstockSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isPlantedTypeSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isFieldSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);
  isDigTreeSizeSelectorOpen: WritableSignal<boolean> = signal<boolean>(false);

  formSubmit = output<void>();
  formUpdate = output<void>();
  formDelete = output<void>();
  
  createPalletContent() {
    if (!this.updatedPalletContentIsValid()) { return; }
    
    const selectedPallet = this.selectedPalletService.selectedPallet();
    const palletContent: PalletContent = {
      ...this.defaultPalletContents,
      palletKey: selectedPallet?.palletKey || -1,
      varietyId: this.varietyId(),
      rootstockId: this.rootstockId(),
      plantedTypeId: this.plantedTypeId(),
      fieldId: this.fieldId(),
      quantity: this.quantity(),
      note: this.note(),
      digTreeSizeId: this.digTreeSizeId(),
      isReceivedWarehouse: this.isReceivedWarehouse(),
    };
    
    this.palletContentsService.createPalletContent(palletContent);
    this.resetForm();
    this.formSubmit.emit();
  }

  resetForm() { 
    this.varietyId.set(-1);
    this.rootstockId.set(-1);
    this.plantedTypeId.set(-1);
    this.fieldId.set(-1);
    this.quantity.set(0);
    this.note.set('');
    this.digTreeSizeId.set(-1);
    this.isReceivedWarehouse.set(false);
  }

  updatePalletContent() {
    if (!this.updatedPalletContentIsValid()) { 
      return; 
    }
    
    const selectedPallet = this.selectedPalletService.selectedPallet();
    const palletContent: PalletContent = {
      ...this.initialPalletContent()!,
      palletKey: selectedPallet?.palletKey || -1,
      varietyId: this.varietyId(),
      rootstockId: this.rootstockId(),
      plantedTypeId: this.plantedTypeId(),
      fieldId: this.fieldId(),
      quantity: this.quantity(),
      note: this.note(),
      digTreeSizeId: this.digTreeSizeId(),
      isReceivedWarehouse: this.isReceivedWarehouse()
    };
    
    this.palletContentsService.updatePalletContent(palletContent);
    this.isEditing.set(false);
    this.formUpdate.emit();
  }

  deletePalletContent() {
    if (!this.initialPalletContent()) { return; }
    this.palletContentsService.deletePalletContent(this.initialPalletContent()!.palletContentsKey);
    this.formDelete.emit();
  }

  constructor() {
    this.varietyService.getVarieties();
    this.rootstockService.getRootstocks();
    this.plantedTypeService.getPlantedTypes();
    this.plantedFieldService.getPlantedFields();
    this.digTreeSizeService.getDigTreeSizes();
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
    return selectedPlantedType?.type || null;
  }

  getSelectedFieldName(): string | null {
    const fields = this.activePlantedFields();
    const selectedField = fields.find(f => f.id === this.fieldId());
    return selectedField?.field || null;
  }

  getSelectedDigTreeSizeName(): string | null {
    const digTreeSizes = this.activeDigTreeSizes();
    const selectedDigTreeSize = digTreeSizes.find(d => d.id === this.digTreeSizeId());
    return selectedDigTreeSize?.size || null;
  }
}
