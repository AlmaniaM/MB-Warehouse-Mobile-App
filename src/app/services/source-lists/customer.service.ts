import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/utils/toast.service';

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

	// Signal-based state
	readonly customersList = signal<Customer[]>([]);
	readonly status = signal<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
	readonly previousDataOperation = signal<'created' | 'updated' | 'deleted' | null>(null);
	readonly requestError = signal<any>(null);

	getCustomers() {
		const previousStatus = this.status();
		this.status.set('fetching');

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
					// Update signals
					this.customersList.set(records);

					if (previousStatus === 'creating') {
						this.previousDataOperation.set('created');
					} else if (previousStatus === 'updating') {
						this.previousDataOperation.set('updated');
					} else if (previousStatus === 'deleting') {
						this.previousDataOperation.set('deleted');
					} else {
						this.previousDataOperation.set(null);
					}
					this.status.set('stable');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'get');
					this.status.set('error');
				}
			});
	}
	getCustomersByIds(ids: string[]) {
		const previousStatus = this.status();
		this.status.set('fetching');

		let requests = new Array<Observable<Customer>>();

		ids.forEach(id => {
			const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/customer/' + id;
			requests.push(this.httpClient.get<Customer>(url));
		});

		forkJoin(requests)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: customers => {
					const records = customers.reduce((acc: Customer[], val) => acc.concat(val), []);

					// Update signals
					this.customersList.set(records);

					if (previousStatus === 'creating') {
						this.previousDataOperation.set('created');
					} else if (previousStatus === 'updating') {
						this.previousDataOperation.set('updated');
					} else if (previousStatus === 'deleting') {
						this.previousDataOperation.set('deleted');
					} else {
						this.previousDataOperation.set(null);
					}
					this.status.set('stable');
				},
				error: (error: HttpErrorResponse) => {
					this.registerRequestError(error, 'get');
					this.status.set('error');
				}
			});
	}
	registerRequestError(error: HttpErrorResponse, cause: 'get' | 'create' | 'update' | 'delete') {
		this.requestError.set({ errorResponse: error, causedBy: cause });

		if (typeof error.error === 'string') {
			this.toastService.openToast(error.error);
			return;
		}
		this.toastService.openToast(error.message);
	}

	// Helper method to get customer name by ID
	getCustomerNameById(customerId: number): string | null {
		const customer = this.customersList().find(c => c.id === customerId);
		return customer ? customer.name : null;
	}

	// Helper method to get customer by ID
	getCustomerById(customerId: number): Customer | null {
		return this.customersList().find(c => c.id === customerId) || null;
	}

	// Helper method to get all active customers
	getActiveCustomers(): Customer[] {
		return this.customersList().filter(c => c.active);
	}
}
