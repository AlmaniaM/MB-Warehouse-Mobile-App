import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/modules/global/classes/utils';

export const defaultPlantedRootPool: PlantedRootPool = {
  id: -1,
  fieldId: -1,
  row: 0,
  plantedTypeId: -1,
  plantedDate: Utils.getNow(),
  plantedYear: Utils.getNow().getFullYear().toString(),
  quantity: null,
  buddingComplete: false,
  dug: false,
  contractYear: null,
  dateDug: null,
  supplierId: -1,
  rootstockId: -1,
  plantedVarietyId: null,
  benchGraft: false,
  replant: false,
  autoTimestampInsert: null
}

export interface PlantedRootPool {
  [key: string]: any;
  id: number;
  plantedYear: string;
  row: number;
  fieldId: number;
  plantedTypeId: number;
  supplierId: number;
  rootstockId: number;
  buddingComplete: boolean;
  dug: boolean;
  benchGraft: boolean;
  replant: boolean;
  plantedDate: Date | null;
  quantity: number | null;
  contractYear: number | null;
  dateDug: Date | null;
  plantedVarietyId: number | null;
  autoTimestampInsert: Date | null;
}

@Injectable({
	providedIn: 'root'
})
export class PlantedRootPoolService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private plantedRootPoolsSubject: BehaviorSubject<PlantedRootPool[]> = new BehaviorSubject<PlantedRootPool[]>(<PlantedRootPool[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly plantedRootPools: Observable<PlantedRootPool[]> = this.plantedRootPoolsSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getPlantedRootPools() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/prebud/plantedrootpools';
		this.httpClient
			.get<PlantedRootPool[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.plantedRootPoolsSubject.next(records);
					this.statusSubject.next('stable');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error);
					this.statusSubject.next('error');
				}
			});
	}

	registerRequestError(error: HttpErrorResponse) {
		this.requestErrorSubject.next({ errorResponse: error });
		if (typeof error.error === 'string') {
			this.toastService.openToast(error.error);
			return;
		}
		this.toastService.openToast(error.message);
	}
}
