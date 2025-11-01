import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/modules/global/classes/utils';
import { MemoizationService } from '../../global/services/memoize.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
	private memoizationService: MemoizationService = new MemoizationService();

	private customersSubject: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>(<Customer[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	public readonly customersMap = this.memoizationService.computedMemo(
		() => new Map(this.customersSubject.value.map(customer => [customer.id, customer])),
		[toSignal(this.customersSubject)],
		{ key: 'customersMap' }
	);

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
