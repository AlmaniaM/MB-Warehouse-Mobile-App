import { Injectable, Signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ShippingSheet } from './shipping-sheet.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
	providedIn: 'root'
})
export class SelectedShippingSheetService {
  
  	private cacheName = `${environment.appName}-SelectedShippingSheet`;
	private selectedShippingSheetSubject: BehaviorSubject<ShippingSheet | null> = new BehaviorSubject<ShippingSheet | null>(null);
	
	public readonly selectedShippingSheet$: Observable<ShippingSheet | null> = this.selectedShippingSheetSubject.asObservable();
	selectedShippingSheet: Signal<ShippingSheet | null> = toSignal(this.selectedShippingSheetSubject.asObservable(), { initialValue: null });

	constructor() { 
		this.getShippingSheet();
	}

	getShippingSheet() {
		const shippingSheet = localStorage.getItem(this.cacheName);
		if (!shippingSheet) {
			this.setShippingSheet(null);
			return;
		}
		this.selectedShippingSheetSubject.next(JSON.parse(shippingSheet));
	}

	setShippingSheet(shippingSheet: ShippingSheet | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(shippingSheet));
		this.selectedShippingSheetSubject.next(shippingSheet);
	}
}
