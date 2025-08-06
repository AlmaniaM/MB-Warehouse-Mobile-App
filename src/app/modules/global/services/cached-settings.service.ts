import { Injectable, Inject, InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

export const SETTINGS_IDENTIFIER = new InjectionToken<string>('SettingsIdentifier');

@Injectable()
export class CachedSettingsService {
  
  private cacheName = environment.appName +'CachedSettings';
	private cachedSettingsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	public readonly cachedSettings: Observable<any> = this.cachedSettingsSubject.asObservable();

  constructor(@Inject(SETTINGS_IDENTIFIER) identifier: string) {
		this.cacheName = `${environment.appName}${identifier}CachedSettings`;
		this.getSettings();
  }

	getSettings() {
		const containerReturnReceipt = localStorage.getItem(this.cacheName);
		if (!containerReturnReceipt) {
			this.setSettings(null);
			return;
		}
		this.cachedSettingsSubject.next(JSON.parse(containerReturnReceipt));
	}

	setSettings(containerReturnReceipt: any) {
		localStorage.setItem(this.cacheName, JSON.stringify(containerReturnReceipt));
		this.cachedSettingsSubject.next(containerReturnReceipt);
	}
}