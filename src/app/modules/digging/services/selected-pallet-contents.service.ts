import { computed, effect, inject, Injectable, Signal, OnDestroy, signal, WritableSignal } from '@angular/core';

import { environment } from 'src/environments/environment';
import { PalletContent, PalletContentsDisplay, PalletContentsService } from 'src/app/modules/digging/services/pallet-contents.service';
import { Pallet } from './pallet.service';
import { Variety, VarietyService } from '../../sourcelists/services/variety.service';
import { Rootstock, RootstockService } from '../../sourcelists/services/rootstock.service';
import { PlantedType, PlantedTypeService } from '../../sourcelists/services/planted-type.service';
import { PlantedField, PlantedFieldService } from '../../sourcelists/services/planted-field.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectedPalletService } from './selected-pallet.service';

// Combined interface for storing selected pallet with its contents display data
export interface SelectedPalletWithContents {
	pallet: Pallet;
	contentsDisplay: PalletContentsDisplay[];
}

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
	
  	private cacheName = environment.appName + 'SelectedPalletWithContents';
	private selectedPallet: Signal<Pallet | null> = computed(() => {
		const selectedPallet = this.selectedPalletService.selectedPallet();
		if (!selectedPallet) { return this.cachedSelectedPalletWithContents()?.pallet || null; }
		return selectedPallet;
	});
	private palletContents: Signal<PalletContent[] | null> = toSignal(this.palletContentsService.palletContents, { initialValue: null });
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
	private varieties: Signal<Variety[] | null> = toSignal(this.varietyService.varieties, { initialValue: null });
	private rootstocks: Signal<Rootstock[] | null> = toSignal(this.rootstockService.rootstocks, { initialValue: null });
	private plantedTypes: Signal<PlantedType[] | null> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: null });
	private plantedFields: Signal<PlantedField[] | null> = toSignal(this.plantedFieldService.plantedFields, { initialValue: null });
	
	private cachedSelectedPalletWithContents: WritableSignal<SelectedPalletWithContents | null> = signal(null);
	selectedPalletContents: Signal<PalletContent[] | null> = computed(() => {
		if (!this.selectedPallet() || !this.palletContentsMap()) { return null; }
		const palletContents = [...(this.palletContentsMap()!.get(this.selectedPallet()!.palletKey) || [])];
		return palletContents;
	});
	
	selectedPalletContentsDisplay: Signal<PalletContentsDisplay[] | null> = computed(() => {
		const selectedPalletContents = this.selectedPalletContents();
		const varieties = this.varieties();
		const rootstocks = this.rootstocks();
		const plantedTypes = this.plantedTypes();
		const plantedFields = this.plantedFields();
		
		if (!selectedPalletContents && !varieties && !rootstocks && !plantedTypes && !plantedFields) { 
			return this.cachedSelectedPalletWithContents()?.contentsDisplay || null; 
		}
		
		const palletContentsDisplay = selectedPalletContents!.map(palletContent => {
			return {
				...palletContent,
				varietyName: varieties!.find(variety => variety.id === palletContent.varietyId)?.name,
				rootstockName: rootstocks!.find(rootstock => rootstock.id === palletContent.rootstockId)?.name,
				plantedTypeName: plantedTypes!.find(plantedType => plantedType.id === palletContent.plantedTypeId)?.['name'],
				fieldName: plantedFields!.find(plantedField => plantedField.id === palletContent.fieldId)?.['name']
			}
		});
		
		return palletContentsDisplay;
	});

	// Combined selected pallet with contents display data
	selectedPalletWithContents: Signal<SelectedPalletWithContents | null> = computed(() => {
		const pallet = this.selectedPallet();
		const contentsDisplay = this.selectedPalletContentsDisplay();
		
		if (!pallet || !contentsDisplay) { 
			return this.cachedSelectedPalletWithContents(); 
		}
		
		return {
			pallet,
			contentsDisplay
		};
	});
	
	// Effect to cache the combined pallet and contents data
	private selectedPalletWithContentsEffect = effect(() => {
		const selectedPalletWithContents = this.selectedPalletWithContents();
		
		if (!selectedPalletWithContents) {
			localStorage.removeItem(this.cacheName);
			return;
		}
		
		localStorage.setItem(this.cacheName, JSON.stringify(selectedPalletWithContents));
	});
	
	constructor() {
		this.setCachedSelectedPalletWithContents();
	}
	
	ngOnDestroy() {
		this.selectedPalletWithContentsEffect.destroy();
	}
	
	// Method to get cached data
	private setCachedSelectedPalletWithContents() {
		const cachedData = localStorage.getItem(this.cacheName);
		if (!cachedData) { return; }
		
		try {
			const parsedData = JSON.parse(cachedData) as SelectedPalletWithContents;
			this.cachedSelectedPalletWithContents.set(parsedData);
		} catch (error) {
			console.error('Error parsing cached selected pallet with contents:', error);
			localStorage.removeItem(this.cacheName);
		}
	}
}
