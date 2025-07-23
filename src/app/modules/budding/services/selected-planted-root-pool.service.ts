import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PlantedRootPool } from 'src/app/modules/budding/services/planted-root-pool.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedPlantedRootPoolService {
  
  private cacheName = environment.appName +'SelectedPlantedRootPool';
	private selectedPlantedRootPoolSubject: BehaviorSubject<PlantedRootPool | null> = new BehaviorSubject<PlantedRootPool | null>(null);
	public readonly selectedPlantedRootPool: Observable<PlantedRootPool | null> = this.selectedPlantedRootPoolSubject.asObservable();

	constructor() { 
		this.getPlantedRootPool();
	}

	getPlantedRootPool() {
		const containerReturnReceipt = localStorage.getItem(this.cacheName);
		if (!containerReturnReceipt) {
			this.setPlantedRootPool(null);
			return;
		}
		this.selectedPlantedRootPoolSubject.next(JSON.parse(containerReturnReceipt));
	}

	setPlantedRootPool(containerReturnReceipt: PlantedRootPool | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(containerReturnReceipt));
		this.selectedPlantedRootPoolSubject.next(containerReturnReceipt);
	}
}