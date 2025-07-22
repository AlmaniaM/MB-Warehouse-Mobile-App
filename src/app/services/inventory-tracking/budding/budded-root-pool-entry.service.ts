import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from '../../utils/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/classes/utils';

export const defaultBuddedRootPoolEntry: BuddedRootPoolEntry = {
  id: -1,
  buddedRootPoolId: -1,
  budderEmployeeId: null,
  customerId: null,
  quantityBudded: 0,
  dateBudded: new Date(),
  notes: null,
  contractYear: null,
  count1: null,
  isFromPlantedVariety: false,
  autoTimestampInsert: null
}

export interface BuddedRootPoolEntry {
  [key: string]: any;
  id: number;
  buddedRootPoolId: number;
  budderEmployeeId: number | null;
  quantityBudded: number;
  customerId: number | null;
  notes: string | null;
  dateBudded: Date;
  contractYear: number | null;
  count1: number | null;
  isFromPlantedVariety: boolean;
  autoTimestampInsert: Date | null;
}

@Injectable({
	providedIn: 'root'
})
export class BuddedRootPoolEntryService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private buddedRootPoolEntriesSubject: BehaviorSubject<BuddedRootPoolEntry[]> = new BehaviorSubject<BuddedRootPoolEntry[]>(<BuddedRootPoolEntry[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly buddedRootPoolEntries: Observable<BuddedRootPoolEntry[]> = this.buddedRootPoolEntriesSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getBuddedRootPoolEntries() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/buddedrootpoolentries';
		this.httpClient
			.get<BuddedRootPoolEntry[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.buddedRootPoolEntriesSubject.next(records);
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
