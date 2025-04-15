import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from '../utils/toast.service';
import { environment } from '../../../environments/environment';

export const defaultContainerType: ContainerType = { 
  id: -1,
  name: '',
  active: true,
  appUser: null,
  autoTimestampInsert: null
}

export interface ContainerType {
  [key: string]: any;
  id: number;
  name: string;
  active: boolean;
	appUser: string | null;
  autoTimestampInsert: Date | null;
}

@Injectable({
	providedIn: 'root'
})
export class ContainerTypeService {
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private containerTypesSubject: BehaviorSubject<ContainerType[]> = new BehaviorSubject<ContainerType[]>(<ContainerType[]> []);
	private justCreatedContainerTypesSubject: BehaviorSubject<ContainerType[]> = new BehaviorSubject<ContainerType[]>(<ContainerType[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
	public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly containerTypes: Observable<ContainerType[]> = this.containerTypesSubject.asObservable();
	public readonly justCreatedContainerTypes: Observable<ContainerType[]> = this.justCreatedContainerTypesSubject.asObservable();
	public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getContainerTypes() {
		const previousStatus = this.statusSubject.value;
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertypes';
		this.httpClient
			.get<ContainerType[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.containerTypesSubject.next(records);
					if (previousStatus === 'creating') {
						this.previousDataOperationSubject.next('created');
					} else if (previousStatus === 'updating') {
						this.previousDataOperationSubject.next('updated');
					} else if (previousStatus === 'deleting') {
						this.previousDataOperationSubject.next('deleted');
					} else {
						this.previousDataOperationSubject.next(null);
					}
					
					this.justCreatedContainerTypesSubject.next(<ContainerType[]> []);
					this.statusSubject.next('stable');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'get');
					this.statusSubject.next('error');
				}
			});
	}

	createContainerTypes(records: ContainerType[]) {
		this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertype';
			requests.push(this.httpClient.post<ContainerType>(url, record));
		});

		forkJoin(requests)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: (justCreatedContainerTypes) => {
					this.justCreatedContainerTypesSubject.next(justCreatedContainerTypes);
					this.getContainerTypes();
          this.toastService.openToast(records.length > 1 ? 'All Records created.' : 'Record created.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'create');
					this.statusSubject.next('error');
				}
			});
	}

	updateContainerTypes(records: ContainerType[]) {
		this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertype';
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
					this.getContainerTypes();
          this.toastService.openToast(records.length > 1 ? 'All Records updated.' : 'Record updated.');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'update');
					this.statusSubject.next('error');
				}
			});
	}

	deleteContainerTypes(records: ContainerType[]) {
		this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
		let requests = new Array<Observable<any>>();

		records.forEach(record => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertype/' + record['id'];
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
					this.getContainerTypes();
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
