import { Injectable, Signal, computed, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PullSheetDetail, PullSheetDetailDisplay } from './pull-sheet-detail.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectedPullSheetMainService } from './selected-pull-sheet-main.service';
import { PullSheetDetailService } from './pull-sheet-detail.service';
import { VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSizeService } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { Variety } from 'src/app/modules/sourcelists/services/variety.service';
import { Rootstock } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedType } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedField } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSize } from 'src/app/modules/sourcelists/services/dig-tree-size.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedPullSheetDetailService {
  
  	private cacheName = `${environment.appName}-SelectedPullSheetDetail`;
	private selectedPullSheetDetailSubject: BehaviorSubject<PullSheetDetail | null> = new BehaviorSubject<PullSheetDetail | null>(null);
	
	selectedPullSheetDetail: Signal<PullSheetDetail | null> = toSignal(this.selectedPullSheetDetailSubject.asObservable(), { initialValue: null });

	private selectedPullSheetMainService: SelectedPullSheetMainService = inject(SelectedPullSheetMainService);
	private pullSheetDetailService: PullSheetDetailService = inject(PullSheetDetailService);
	private varietyService: VarietyService = inject(VarietyService);
	private rootstockService: RootstockService = inject(RootstockService);
	private plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
	private plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
	private digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);

	private varieties: Signal<Variety[] | null> = toSignal(this.varietyService.varieties, { initialValue: null });
	private rootstocks: Signal<Rootstock[] | null> = toSignal(this.rootstockService.rootstocks, { initialValue: null });
	private plantedTypes: Signal<PlantedType[] | null> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: null });
	private plantedFields: Signal<PlantedField[] | null> = toSignal(this.plantedFieldService.plantedFields, { initialValue: null });
	private digTreeSizes: Signal<DigTreeSize[] | null> = toSignal(this.digTreeSizeService.digTreeSizes, { initialValue: null });
	private pullSheetDetails: Signal<PullSheetDetail[] | null> = toSignal(this.pullSheetDetailService.pullSheetDetails, { initialValue: null });
	private selectedPullSheetMain: Signal<any | null> = toSignal(this.selectedPullSheetMainService.selectedPullSheetMain$, { initialValue: null });

	selectedPullSheetDetailsDisplay: Signal<PullSheetDetailDisplay[] | null> = computed(() => {
		if (!this.selectedPullSheetMain() || !this.pullSheetDetails()) { return null; }
		
		const selectedSheetDetails = this.pullSheetDetails()!.filter(detail => 
			detail.pullSheetId === this.selectedPullSheetMain()!.id
		);
		
		const varieties = this.varieties();
		const rootstocks = this.rootstocks();
		const plantedTypes = this.plantedTypes();
		const plantedFields = this.plantedFields();
		const digTreeSizes = this.digTreeSizes();
		
		if (!varieties || !rootstocks || !plantedTypes || !plantedFields || !digTreeSizes) { 
			return null; 
		}
		
		const pullSheetDetailsDisplay = selectedSheetDetails.map(detail => {
			return {
				...detail,
				varietyName: varieties.find(variety => variety.id === detail.varietyId)?.name,
				rootstockName: rootstocks.find(rootstock => rootstock.id === detail.rootstockId)?.name,
				treeTypeName: plantedTypes.find(plantedType => plantedType.id === detail.treeTypeId)?.['type'],
				fieldName: plantedFields.find(plantedField => plantedField.id === detail.fieldId)?.['field'],
				sizeName: digTreeSizes.find(digTreeSize => digTreeSize.id === detail.sizeId)?.size
			}
		});
		
		return pullSheetDetailsDisplay;
	});

	constructor() { 
		this.getPullSheetDetail();
	}

	getPullSheetDetail() {
		const pullSheetDetail = localStorage.getItem(this.cacheName);
		if (!pullSheetDetail) {
			this.setPullSheetDetail(null);
			return;
		}
		this.selectedPullSheetDetailSubject.next(JSON.parse(pullSheetDetail));
	}

	setPullSheetDetail(pullSheetDetail: PullSheetDetail | null) {
		this.storeSelectedPullSheetDetail(pullSheetDetail);
		this.selectedPullSheetDetailSubject.next(pullSheetDetail);
	}
	
	private storeSelectedPullSheetDetail(pullSheetDetail: PullSheetDetail | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(pullSheetDetail));
	}
}
