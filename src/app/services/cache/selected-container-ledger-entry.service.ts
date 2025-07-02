import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ContainerLedgerEntry, CustomerContainerLedgerEntry } from '../inventory-tracking/container-tracking/container-ledger.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedContainerLedgerEntryService {
  
  private cacheName = environment.appName +'SelectedContainerLedgerEntry';
	private selectedContainerLedgerEntrySubject: BehaviorSubject<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = new BehaviorSubject<ContainerLedgerEntry | CustomerContainerLedgerEntry | null>(null);
	public readonly selectedContainerLedgerEntry: Observable<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = this.selectedContainerLedgerEntrySubject.asObservable();

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
	}

	setContainerLedgerEntry(containerLedgerEntry: ContainerLedgerEntry | CustomerContainerLedgerEntry | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(containerLedgerEntry));
		this.selectedContainerLedgerEntrySubject.next(containerLedgerEntry);
	}
}