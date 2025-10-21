import { Injectable, Signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ShipSheetDetail, ShipSheetDetailDisplay } from './ship-sheet-detail.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectedShippingSheetService } from './selected-shipping-sheet.service';
import { ShipSheetDetailService } from './ship-sheet-detail.service';
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
export class SelectedShipSheetDetailService {
  
  	private cacheName = `${environment.appName}-SelectedShipSheetDetail`;
	private selectedShipSheetDetailSubject: BehaviorSubject<ShipSheetDetail | null> = new BehaviorSubject<ShipSheetDetail | null>(null);
	
	public readonly selectedShipSheetDetail$: Observable<ShipSheetDetail | null> = this.selectedShipSheetDetailSubject.asObservable();
	selectedShipSheetDetail: Signal<ShipSheetDetail | null> = toSignal(this.selectedShipSheetDetailSubject.asObservable(), { initialValue: null });

	private selectedShippingSheetService: SelectedShippingSheetService = inject(SelectedShippingSheetService);
	private shipSheetDetailService: ShipSheetDetailService = inject(ShipSheetDetailService);
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
	private shipSheetDetails: Signal<ShipSheetDetail[] | null> = toSignal(this.shipSheetDetailService.shipSheetDetails, { initialValue: null });
	private selectedShippingSheet: Signal<any | null> = toSignal(this.selectedShippingSheetService.selectedShippingSheet$, { initialValue: null });

	selectedShipSheetDetailsDisplay: Signal<ShipSheetDetailDisplay[] | null> = computed(() => {
		if (!this.selectedShippingSheet() || !this.shipSheetDetails()) { return null; }
		
		const selectedSheetDetails = this.shipSheetDetails()!.filter(detail => 
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
		
		const shipSheetDetailsDisplay = selectedSheetDetails.map(detail => {
			return {
				...detail,
				varietyName: varieties.find(variety => variety.id === detail.varietyId)?.name,
				rootstockName: rootstocks.find(rootstock => rootstock.id === detail.rootstockId)?.name,
				plantedTypeName: plantedTypes.find(plantedType => plantedType.id === detail.plantedTypeId)?.['type'],
				fieldName: plantedFields.find(plantedField => plantedField.id === detail.fieldId)?.['field'],
				digTreeSizeName: digTreeSizes.find(digTreeSize => digTreeSize.id === detail.digTreeSizeId)?.size,
				containerTypeName: containerTypes.find(containerType => containerType.id === detail.containerTypeId)?.['type']
			}
		});
		
		return shipSheetDetailsDisplay;
	});

	constructor() { 
		this.getShipSheetDetail();
	}

	getShipSheetDetail() {
		const shipSheetDetail = localStorage.getItem(this.cacheName);
		if (!shipSheetDetail) {
			this.setShipSheetDetail(null);
			return;
		}
		this.selectedShipSheetDetailSubject.next(JSON.parse(shipSheetDetail));
	}

	setShipSheetDetail(shipSheetDetail: ShipSheetDetail | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(shipSheetDetail));
		this.selectedShipSheetDetailSubject.next(shipSheetDetail);
	}
}
