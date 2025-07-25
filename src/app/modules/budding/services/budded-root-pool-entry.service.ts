import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/modules/global/classes/utils';

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
  private justCreatedBuddedRootPoolEntriesSubject: BehaviorSubject<BuddedRootPoolEntry[]> = new BehaviorSubject<BuddedRootPoolEntry[]>(<BuddedRootPoolEntry[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly buddedRootPoolEntries: Observable<BuddedRootPoolEntry[]> = this.buddedRootPoolEntriesSubject.asObservable();
	public readonly justCreatedBuddedRootPoolEntries: Observable<BuddedRootPoolEntry[]> = this.justCreatedBuddedRootPoolEntriesSubject.asObservable();
  public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getBuddedRootPoolEntries() {
		const previousStatus = this.statusSubject.value;
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpoolentries';
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
					if (previousStatus === 'creating') {
						this.previousDataOperationSubject.next('created');
					} else if (previousStatus === 'updating') {
						this.previousDataOperationSubject.next('updated');
					} else if (previousStatus === 'deleting') {
						this.previousDataOperationSubject.next('deleted');
					} else {
						this.previousDataOperationSubject.next(null);
					}
					
					this.justCreatedBuddedRootPoolEntriesSubject.next(<BuddedRootPoolEntry[]> []);
					this.statusSubject.next('stable');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'get');
					this.statusSubject.next('error');
				}
			});
	}

	createBuddedRootPoolEntries(records: BuddedRootPoolEntry[]) {
		this.statusSubject.next('creating');
		this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpoolentry';
			requests.push(this.httpClient.post<BuddedRootPoolEntry>(url, record));
		});

		forkJoin(requests)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: (justCreatedBuddedRootPoolEntries) => {
					this.justCreatedBuddedRootPoolEntriesSubject.next(justCreatedBuddedRootPoolEntries);
					this.getBuddedRootPoolEntries();
					this.toastService.openToast(records.length > 1 ? 'All Records created.' : 'Record created.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'create');
					this.statusSubject.next('error');
				}
			});
	}

	updateBuddedRootPoolEntries(records: BuddedRootPoolEntry[]) {
		this.statusSubject.next('updating');
		this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpoolentry';
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
					this.getBuddedRootPoolEntries();
					this.toastService.openToast(records.length > 1 ? 'All Records updated.' : 'Record updated.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'update');
					this.statusSubject.next('error');
				}
			});
	}

	deleteBuddedRootPoolEntries(records: BuddedRootPoolEntry[]) {
		this.statusSubject.next('deleting');
		this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/budding/buddedrootpoolentry/' + record['id'];
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
					this.getBuddedRootPoolEntries();
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
