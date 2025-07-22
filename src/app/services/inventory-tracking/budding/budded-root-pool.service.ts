import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from '../../utils/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/classes/utils';

export const defaultBuddedRootPool: BuddedRootPool = {
  id: -1,
  varietyId: -1,
  plantedRootPoolId: -1,
  autoTimestampInsert: null
}

export interface BuddedRootPool {
  [key: string]: any;
  id: number;
  varietyId: number;
  plantedRootPoolId: number;
  autoTimestampInsert: Date | null;
}

@Injectable({
	providedIn: 'root'
})
export class BuddedRootPoolService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private buddedRootPoolsSubject: BehaviorSubject<BuddedRootPool[]> = new BehaviorSubject<BuddedRootPool[]>(<BuddedRootPool[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly buddedRootPools: Observable<BuddedRootPool[]> = this.buddedRootPoolsSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getBuddedRootPools() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/buddedrootpools';
		this.httpClient
			.get<BuddedRootPool[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.buddedRootPoolsSubject.next(records);
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
