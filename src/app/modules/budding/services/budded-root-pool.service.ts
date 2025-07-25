import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/modules/global/classes/utils';

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
	private justCreatedBuddedRootPoolsSubject: BehaviorSubject<BuddedRootPool[]> = new BehaviorSubject<BuddedRootPool[]>(<BuddedRootPool[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
	public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly buddedRootPools: Observable<BuddedRootPool[]> = this.buddedRootPoolsSubject.asObservable();
	public readonly justCreatedBuddedRootPools: Observable<BuddedRootPool[]> = this.justCreatedBuddedRootPoolsSubject.asObservable();
	public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getBuddedRootPools() {
		const previousStatus = this.statusSubject.value;
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpools';
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
					if (previousStatus === 'creating') {
						this.previousDataOperationSubject.next('created');
					} else if (previousStatus === 'updating') {
						this.previousDataOperationSubject.next('updated');
					} else if (previousStatus === 'deleting') {
						this.previousDataOperationSubject.next('deleted');
					} else {
						this.previousDataOperationSubject.next(null);
					}
					
					this.justCreatedBuddedRootPoolsSubject.next(<BuddedRootPool[]> []);
					this.statusSubject.next('stable');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'get');
					this.statusSubject.next('error');
				}
			});
	}

	createBuddedRootPools(records: BuddedRootPool[]) {
		this.statusSubject.next('creating');
		this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpool';
			requests.push(this.httpClient.post<BuddedRootPool>(url, record));
		});

		forkJoin(requests)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: (justCreatedBuddedRootPools) => {
					this.justCreatedBuddedRootPoolsSubject.next(justCreatedBuddedRootPools);
					this.getBuddedRootPools();
					this.toastService.openToast(records.length > 1 ? 'All Records created.' : 'Record created.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'create');
					this.statusSubject.next('error');
				}
			});
	}

	updateBuddedRootPools(records: BuddedRootPool[]) {
		this.statusSubject.next('updating');
		this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpool';
			requests.push(this.httpClient.put(url, record, { responseType: 'text' }));
		});

		forkJoin(requests)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: () => {
					this.getBuddedRootPools();
					this.toastService.openToast(records.length > 1 ? 'All Records updated.' : 'Record updated.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'update');
					this.statusSubject.next('error');
				}
			});
	}

	deleteBuddedRootPools(records: BuddedRootPool[]) {
		this.statusSubject.next('deleting');
		this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpool/' + record['id'];
			requests.push(this.httpClient.delete(url, { responseType: 'text' }));
		});

		forkJoin(requests)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: () => {
					this.getBuddedRootPools();
					this.toastService.openToast(records.length > 1 ? 'All Records deleted.' : 'Record deleted.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'delete');
					this.statusSubject.next('error');
				}
			});
	}

	registerRequestError(error: HttpErrorResponse, cause: 'get' | 'create' | 'update' | 'delete') {
		this.requestErrorSubject.next({ errorResponse: error, causedBy: cause });
		if (typeof error.error === 'string') {
			this.toastService.openToast(error.error);
			return;
		}
		this.toastService.openToast(error.message);
	}
}

