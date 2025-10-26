import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PullSheetMain } from './pull-sheet-main.service';

@Injectable({
	providedIn: 'root'
})
export class SelectedPullSheetMainService {
  
  	private cacheName = `${environment.appName}-SelectedPullSheetMain`;
	private selectedPullSheetMainSubject: BehaviorSubject<PullSheetMain | null> = new BehaviorSubject<PullSheetMain | null>(null);
	
	public readonly selectedPullSheetMain$: Observable<PullSheetMain | null> = this.selectedPullSheetMainSubject.asObservable();

	constructor() { 
		this.getPullSheetMain();
	}

	getPullSheetMain() {
		const pullSheetMain = localStorage.getItem(this.cacheName);
		if (!pullSheetMain) {
			this.setPullSheetMain(null);
			return;
		}
		this.selectedPullSheetMainSubject.next(JSON.parse(pullSheetMain));
	}

	setPullSheetMain(pullSheetMain: PullSheetMain | null) {
		localStorage.setItem(this.cacheName, JSON.stringify(pullSheetMain));
		this.selectedPullSheetMainSubject.next(pullSheetMain);
	}
}
