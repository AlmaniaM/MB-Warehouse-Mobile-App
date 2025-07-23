import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/modules/global/classes/utils';

export const defaultRootstock: Rootstock = { 
	id: -1,
	name: '',
	active: true,
	appUser: null,
	autoTimestampInsert: null
}

export interface Rootstock {
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
export class RootstockService {
	
	private httpClient: HttpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

	private rootstocksSubject: BehaviorSubject<Rootstock[]> = new BehaviorSubject<Rootstock[]>(<Rootstock[]> []);
	public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
	public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	public readonly rootstocks: Observable<Rootstock[]> = this.rootstocksSubject.asObservable();
	public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
	public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

	getRootstocks() {
		this.statusSubject.next('fetching');
		const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/rootstocks';
		this.httpClient
			.get<Rootstock[]>(url)
			.pipe(
				catchError(error => {
					throw error;
				})
			)
			.subscribe({
				next: records => {
					this.rootstocksSubject.next(records);
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
