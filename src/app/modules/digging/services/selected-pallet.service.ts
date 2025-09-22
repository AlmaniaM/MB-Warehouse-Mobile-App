import { Injectable, Signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Pallet } from 'src/app/modules/digging/services/pallet.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
	providedIn: 'root'
})
export class SelectedPalletService {
  
  private cacheName = environment.appName +'SelectedPallet';
	private selectedPalletSubject: BehaviorSubject<Pallet | null> = new BehaviorSubject<Pallet | null>(null);
	public readonly selectedPallet$: Observable<Pallet | null> = this.selectedPalletSubject.asObservable();
	selectedPallet: Signal<Pallet | null> = toSignal(this.selectedPalletSubject.asObservable(), { initialValue: null });

	constructor() { 
		this.getPallet();
	}

	getPallet() {
		const pallet = localStorage.getItem(this.cacheName);
		if (!pallet) {
			this.setPallet(null);
			return;
		}
		this.selectedPalletSubject.next(JSON.parse(pallet));
	}

	setPallet(pallet: Pallet | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(pallet));
		this.selectedPalletSubject.next(pallet);
	}
}
