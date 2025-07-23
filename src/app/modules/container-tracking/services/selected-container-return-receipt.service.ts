import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ContainerReturnReceipt } from 'src/app/modules/container-tracking/services/container-return-receipt.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedContainerReturnReceiptService {
  
  private cacheName = environment.appName +'SelectedContainerReturnReceipt';
	private selectedContainerReturnReceiptSubject: BehaviorSubject<ContainerReturnReceipt | null> = new BehaviorSubject<ContainerReturnReceipt | null>(null);
	public readonly selectedContainerReturnReceipt: Observable<ContainerReturnReceipt | null> = this.selectedContainerReturnReceiptSubject.asObservable();

	constructor() { 
		this.getContainerReturnReceipt();
	}

	getContainerReturnReceipt() {
		const containerReturnReceipt = localStorage.getItem(this.cacheName);
		if (!containerReturnReceipt) {
			this.setContainerReturnReceipt(null);
			return;
		}
		this.selectedContainerReturnReceiptSubject.next(JSON.parse(containerReturnReceipt));
	}

	setContainerReturnReceipt(containerReturnReceipt: ContainerReturnReceipt | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(containerReturnReceipt));
		this.selectedContainerReturnReceiptSubject.next(containerReturnReceipt);
	}
}