import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from '../utils/toast.service';
import { environment } from '../../../environments/environment';
import { Utils } from 'src/app/classes/utils';

export const defaultCustomer: Customer = {
  id: -1,
  name: '',
  primaryContactName: null,
  primaryContactNumber: null,
  primaryContactEmail: null,
  primaryContactNotes: null,
  active: true,
  autoTimestampInsert: null,
  parentId: null,
  entityType: 'Company',
  appUser: null,
  outsideSalesCommissionRate: null
}

export interface Customer {
  [key: string]: any;
  id: number;
  name: string;
  primaryContactName: string | null;
  primaryContactNumber: string | null;
  primaryContactEmail: string | null;
  primaryContactNotes: string | null;
  active: boolean;
  autoTimestampInsert: Date | null;
  parentId: number | null;
  entityType: 'Outside Sales Company' | 'Company' | 'Ranch' | 'Grower';
  appUser: string | null;
  outsideSalesCommissionRate: number | null;
}

@Injectable({
	providedIn: 'root'
})
export class CustomerService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private customersSubject: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>(<Customer[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly customers: Observable<Customer[]> = this.customersSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getCustomers() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/customers';
		this.httpClient
			.get<Customer[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.customersSubject.next(records);
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
