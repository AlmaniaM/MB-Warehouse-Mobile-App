import { Injectable, Signal, computed, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ShippingSheetContent, ShippingSheetDetailDisplay } from './shipping-sheet-detail.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectedShippingSheetService } from './selected-shipping-sheet.service';
import { ShippingSheetDetailService } from './shipping-sheet-detail.service';
import { VarietyService } from 'src/app/modules/sourcelists/services/variety.service';
import { RootstockService } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedTypeService } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedFieldService } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSizeService } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { ContainerTypeService } from 'src/app/modules/sourcelists/services/container-type.service';
import { Variety } from 'src/app/modules/sourcelists/services/variety.service';
import { Rootstock } from 'src/app/modules/sourcelists/services/rootstock.service';
import { PlantedType } from 'src/app/modules/sourcelists/services/planted-type.service';
import { PlantedField } from 'src/app/modules/sourcelists/services/planted-field.service';
import { DigTreeSize } from 'src/app/modules/sourcelists/services/dig-tree-size.service';
import { ContainerType } from 'src/app/modules/sourcelists/services/container-type.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedShippingSheetDetailService {
  
  	private cacheName = `${environment.appName}-SelectedShippingSheetDetail`;
	private selectedShippingSheetDetailSubject: BehaviorSubject<ShippingSheetContent | null> = new BehaviorSubject<ShippingSheetContent | null>(null);
	
	selectedShippingSheetDetail: Signal<ShippingSheetContent | null> = toSignal(this.selectedShippingSheetDetailSubject.asObservable(), { initialValue: null });

	private selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
	private shippingSheetDetailService: ShippingSheetDetailService = inject(ShippingSheetDetailService);
	private varietyService: VarietyService = inject(VarietyService);
	private rootstockService: RootstockService = inject(RootstockService);
	private plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
	private plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
	private digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);
	private containerTypeService: ContainerTypeService = inject(ContainerTypeService);

	private varieties: Signal<Variety[] | null> = toSignal(this.varietyService.varieties, { initialValue: null });
	private rootstocks: Signal<Rootstock[] | null> = toSignal(this.rootstockService.rootstocks, { initialValue: null });
	private plantedTypes: Signal<PlantedType[] | null> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: null });
	private plantedFields: Signal<PlantedField[] | null> = toSignal(this.plantedFieldService.plantedFields, { initialValue: null });
	private digTreeSizes: Signal<DigTreeSize[] | null> = toSignal(this.digTreeSizeService.digTreeSizes, { initialValue: null });
	private containerTypes: Signal<ContainerType[] | null> = toSignal(this.containerTypeService.containerTypes, { initialValue: null });
	private shippingSheetDetails: Signal<ShippingSheetContent[] | null> = toSignal(this.shippingSheetDetailService.shippingSheetDetails, { initialValue: null });
	private selectedShippingSheet: Signal<any | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });

	selectedShippingSheetDetailsDisplay: Signal<ShippingSheetDetailDisplay[] | null> = computed(() => {
		if (!this.selectedShippingSheet() || !this.shippingSheetDetails()) { return null; }
		
		const selectedSheetDetails = this.shippingSheetDetails()!.filter(detail => 
			detail.shipmentNum === this.selectedShippingSheet()!.shipmentNum && 
			detail.shipmentYear === this.selectedShippingSheet()!.shipmentYear
		);
		
		const varieties = this.varieties();
		const rootstocks = this.rootstocks();
		const plantedTypes = this.plantedTypes();
		const plantedFields = this.plantedFields();
		const digTreeSizes = this.digTreeSizes();
		const containerTypes = this.containerTypes();
		
		if (!varieties || !rootstocks || !plantedTypes || !plantedFields || !digTreeSizes || !containerTypes) { 
			return null; 
		}
		
		const shippingSheetDetailsDisplay = selectedSheetDetails.map(detail => {
			return {
				...detail,
				varietyName: varieties.find(variety => variety.id === detail.varietyId)?.name,
				rootstockName: rootstocks.find(rootstock => rootstock.id === detail.rootstockId)?.name,
				plantedTypeName: plantedTypes.find(plantedType => plantedType.id === detail.plantedTypeId)?.['type'],
				sourceFieldName: plantedFields.find(plantedField => plantedField.id === detail.sourceFieldId)?.['field'],
				digTreeSizeName: digTreeSizes.find(digTreeSize => digTreeSize.id === detail.digTreeSizeId)?.size,
				containerTypeName: containerTypes.find(containerType => containerType.id === detail.containerTypeId)?.['type']
			}
		});
		
		return shippingSheetDetailsDisplay;
	});

	constructor() { 
		this.getShippingSheetDetail();
	}

	getShippingSheetDetail() {
		const shippingSheetDetail = localStorage.getItem(this.cacheName);
		if (!shippingSheetDetail) {
			this.setShippingSheetDetail(null);
			return;
		}
		this.selectedShippingSheetDetailSubject.next(JSON.parse(shippingSheetDetail));
	}

	setShippingSheetDetail(shippingSheetDetail: ShippingSheetContent | null) {
		this.storeSelectedShippingSheetDetail(shippingSheetDetail);
		this.selectedShippingSheetDetailSubject.next(shippingSheetDetail);
	}
	
	private storeSelectedShippingSheetDetail(shippingSheetDetail: ShippingSheetContent | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(shippingSheetDetail));
	}
}
