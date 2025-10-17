import { computed, effect, inject, Injectable, Signal, OnDestroy, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from 'src/environments/environment';
import { PalletContent, PalletContentsDisplay, PalletContentsService } from './pallet-contents.service';
import { Pallet } from './pallet.service';
import { Variety, VarietyService } from '../../sourcelists/services/variety.service';
import { Rootstock, RootstockService } from '../../sourcelists/services/rootstock.service';
import { PlantedType, PlantedTypeService } from '../../sourcelists/services/planted-type.service';
import { PlantedField, PlantedFieldService } from '../../sourcelists/services/planted-field.service';
import { SelectedPalletService } from './selected-pallet.service';

@Injectable({
  providedIn: 'root'
})
export class SelectedPalletContentsService implements OnDestroy {

  private selectedPalletService: SelectedPalletService = inject(SelectedPalletService);
  private varietyService: VarietyService = inject(VarietyService);
  private rootstockService: RootstockService = inject(RootstockService);
  private plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  private plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  private palletContentsService: PalletContentsService = inject(PalletContentsService);

  private cacheName = `${environment.appName}-SelectedPalletContent`;
  private varieties: Signal<Variety[] | null> = toSignal(this.varietyService.varieties, { initialValue: null });
  private rootstocks: Signal<Rootstock[] | null> = toSignal(this.rootstockService.rootstocks, { initialValue: null });
  private plantedTypes: Signal<PlantedType[] | null> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: null });
  private plantedFields: Signal<PlantedField[] | null> = toSignal(this.plantedFieldService.plantedFields, { initialValue: null });
  private palletContents: Signal<PalletContent[] | null> = toSignal(this.palletContentsService.palletContents, { initialValue: null });
  private cachedSelectedPalletContent: WritableSignal<PalletContent | null> = signal(null);
  private selectedPallet: Signal<Pallet | null> = computed(() => this.selectedPalletService.selectedPallet());
  private palletContentsMap: Signal<Map<number, PalletContent[]> | null> = computed(() => {
    if (!this.palletContents()) { return null; }
    
    const palletContentsMap = new Map<number, PalletContent[]>();
    for (const palletContent of this.palletContents()!) {
      if (!palletContentsMap.has(palletContent.palletKey)) {
        palletContentsMap.set(palletContent.palletKey, []);
      }
      palletContentsMap.get(palletContent.palletKey)!.push(palletContent);
    }
    return palletContentsMap;
  });
  
  selectedPalletContent: Signal<PalletContent | null> = computed(() => {
    return this.cachedSelectedPalletContent();
  });

  selectedPalletContentsDisplay: Signal<PalletContentsDisplay[] | null> = computed(() => {
    if (!this.selectedPallet() || !this.palletContentsMap()) { return null; }
    
    const selectedPalletContents = [...(this.palletContentsMap()!.get(this.selectedPallet()!.palletKey) || [])];
    const varieties = this.varieties();
    const rootstocks = this.rootstocks();
    const plantedTypes = this.plantedTypes();
    const plantedFields = this.plantedFields();
    
    if (!varieties || !rootstocks || !plantedTypes || !plantedFields) { 
      return null; 
    }
    
    const palletContentsDisplay = selectedPalletContents.map(palletContent => {
      return {
        ...palletContent,
        varietyName: varieties.find(variety => variety.id === palletContent.varietyId)?.name,
        rootstockName: rootstocks.find(rootstock => rootstock.id === palletContent.rootstockId)?.name,
        plantedTypeName: plantedTypes.find(plantedType => plantedType.id === palletContent.plantedTypeId)?.['name'],
        fieldName: plantedFields.find(plantedField => plantedField.id === palletContent.fieldId)?.['name']
      }
    });
    
    return palletContentsDisplay;
  });

  constructor() {
    this.setCachedSelectedPalletContent();
  }

  ngOnDestroy() {
    this.selectedPalletContentEffect.destroy();
  }

  setPalletContent(palletContent: PalletContent | null) {
    localStorage.setItem(this.cacheName, JSON.stringify(palletContent));
    this.cachedSelectedPalletContent.set(palletContent);
  }

  private selectedPalletContentEffect = effect(() => {
    const selectedPalletContent = this.selectedPalletContent();
    
    if (!selectedPalletContent) {
      localStorage.removeItem(this.cacheName);
      return;
    }
    
    localStorage.setItem(this.cacheName, JSON.stringify(selectedPalletContent));
  });

  private setCachedSelectedPalletContent() {
    const cachedData = localStorage.getItem(this.cacheName);
    if (!cachedData) { return; }
    
    try {
      const parsedData = JSON.parse(cachedData) as PalletContent;
      this.cachedSelectedPalletContent.set(parsedData);
    } catch (error) {
      console.error('Error parsing cached selected pallet content:', error);
      localStorage.removeItem(this.cacheName);
    }
  }

}