import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BuddedRootPoolEntry } from 'src/app/modules/budding/services/budded-root-pool-entry.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedBuddingEntryService {
  
  private cacheName = environment.appName +'SelectedBuddedRootPoolEntry';
	private selectedBuddedRootPoolEntrySubject: BehaviorSubject<BuddedRootPoolEntry | null> = new BehaviorSubject<BuddedRootPoolEntry | null>(null);
	public readonly selectedBuddedRootPoolEntry: Observable<BuddedRootPoolEntry | null> = this.selectedBuddedRootPoolEntrySubject.asObservable();

	constructor() { 
		this.getBuddedRootPoolEntry();
	}

	getBuddedRootPoolEntry() {
		const containerReturnReceipt = localStorage.getItem(this.cacheName);
		if (!containerReturnReceipt) {
			this.setBuddedRootPoolEntry(null);
			return;
		}
		this.selectedBuddedRootPoolEntrySubject.next(JSON.parse(containerReturnReceipt));
	}

	setBuddedRootPoolEntry(containerReturnReceipt: BuddedRootPoolEntry | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(containerReturnReceipt));
		this.selectedBuddedRootPoolEntrySubject.next(containerReturnReceipt);
	}
}