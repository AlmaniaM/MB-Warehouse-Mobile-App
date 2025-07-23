import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/modules/global/classes/utils';

export const defaultPlantedType: PlantedType = { 
	id: -1,
	type: '',
	active: true,
	appUser: null,
	autoTimestampInsert: null
}

export interface PlantedType {
  [key: string]: any;
	id: number;
	type: string ;
	active: boolean;
	appUser: string | null;
	autoTimestampInsert: Date | null;
}

@Injectable({
	providedIn: 'root'
})
export class PlantedTypeService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private plantedTypesSubject: BehaviorSubject<PlantedType[]> = new BehaviorSubject<PlantedType[]>(<PlantedType[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly plantedTypes: Observable<PlantedType[]> = this.plantedTypesSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getPlantedTypes() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/plantedtypes';
		this.httpClient
			.get<PlantedType[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.plantedTypesSubject.next(records);
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
