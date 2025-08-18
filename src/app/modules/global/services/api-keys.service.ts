import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ApiKeysService {

  private httpClient = inject(HttpClient);
	private toastService: ToastService = inject(ToastService);

  public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public readonly status: Observable<'fetching' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  private mbnReportServiceApiKeySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public readonly mbnReportServiceApiKey: Observable<string> = this.mbnReportServiceApiKeySubject.asObservable();

  getMbnReportServiceApiKey() {
    this.statusSubject.next('fetching');
    this.httpClient
      .get(environment.azureInventoryTrackingApiBaseUrl + 'mbn/apikeys/mbnreportservice', { responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          throw error;
        })
      )
      .subscribe({
        next: (apiKey: string) => {
          this.mbnReportServiceApiKeySubject.next(apiKey);
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
