import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from '../../utils/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/classes/utils';

export const defaultVariety: Variety = { 
	id: -1,
	name: '',
	active: true,
	legalDescription: null,
	licensingStatement: null,
	royaltyRate: null,
	mbnPortion: null,
	commissionRate: null,
	masterLicenseHolder: null,
	subLicenseHolder: null,
	licenseHolderPhone: null,
	licenseHolderEmail: null,
	licenseHolderAddress: null,
	notes: null,
	autoTimestampInsert: null,
	appUser: null
}

export interface Variety {
  [key: string]: any;
	id: number;
	name: string;
	active: boolean;
	legalDescription: string | null;
	licensingStatement: string | null;
	royaltyRate: number | null;
	mbnPortion: number | null;
	commissionRate: number | null;
	masterLicenseHolder: string | null;
	subLicenseHolder: string | null;
	licenseHolderPhone: string | null;
	licenseHolderEmail: string | null;
	licenseHolderAddress: string | null;
	notes: string | null;
	autoTimestampInsert: Date | null;
	appUser: string | null;
}

@Injectable({
	providedIn: 'root'
})
export class VarietyService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private varietiesSubject: BehaviorSubject<Variety[]> = new BehaviorSubject<Variety[]>(<Variety[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly varieties: Observable<Variety[]> = this.varietiesSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getVarieties() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/varieties';
		this.httpClient
			.get<Variety[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.varietiesSubject.next(records);
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
