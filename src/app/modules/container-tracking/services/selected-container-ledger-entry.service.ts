import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/modules/container-tracking/services/container-ledger.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedContainerLedgerEntryService {
  
  private cacheName = environment.appName +'SelectedContainerLedgerEntry';
	private selectedContainerLedgerEntrySubject: BehaviorSubject<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = new BehaviorSubject<ContainerLedgerEntry | CustomerContainerLedgerEntry | null>(null);
	private selectedContainerLedgerEntryTypeSubject: BehaviorSubject<'Customer' | 'Internal' | null> = new BehaviorSubject<'Customer' | 'Internal' | null>(null);

	public readonly selectedContainerLedgerEntry: Observable<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = this.selectedContainerLedgerEntrySubject.asObservable();
	public readonly selectedContainerLedgerEntryType: Observable<'Customer' | 'Internal' | null> = this.selectedContainerLedgerEntryTypeSubject.asObservable();

	constructor() { 
		this.getContainerLedgerEntry();
	}

	getContainerLedgerEntry() {
		const containerLedgerEntry = localStorage.getItem(this.cacheName);
		if (!containerLedgerEntry) {
			this.setContainerLedgerEntry(null);
			return;
		}
		this.selectedContainerLedgerEntrySubject.next(JSON.parse(containerLedgerEntry));
		this.selectedContainerLedgerEntryTypeSubject.next(this.getLedgerEntryType());
	}

	setContainerLedgerEntry(containerLedgerEntry: ContainerLedgerEntry | CustomerContainerLedgerEntry | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(containerLedgerEntry));
		this.selectedContainerLedgerEntrySubject.next(containerLedgerEntry);
		this.selectedContainerLedgerEntryTypeSubject.next(this.getLedgerEntryType());
	}

	private getLedgerEntryType(): 'Customer' | 'Internal' | null {
		if (this.selectedContainerLedgerEntrySubject.value === null) {
			return null;
		}
		if ('customerId' in this.selectedContainerLedgerEntrySubject.value) {
			return 'Customer';
		} 
		return 'Internal';
	}
}