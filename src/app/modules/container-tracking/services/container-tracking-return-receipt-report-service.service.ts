import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ToastService } from 'src/app/modules/global/services/toast.service';
import { CachedApiKeysService } from '../../global/services/cached-api-keys.service';

export type ContainerReceiptEmailRequest = {
  user: string;
  replyToEmail: string;
  toEmails: string[];
  emailMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerTrackingReturnReceiptReportServiceService {

  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);
  private cachedApiKeysService: CachedApiKeysService = inject(CachedApiKeysService);
  private mbnReportServiceApiKey: Signal<string | null> = toSignal(this.cachedApiKeysService.mbnReportServiceApiKey, { initialValue: null });

  public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public readonly status: Observable<'fetching' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  private containerReturnReceiptReportHtmlSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public readonly containerReturnReceiptReportHtml: Observable<string> = this.containerReturnReceiptReportHtmlSubject.asObservable();

  getContainerReturnReceiptReportHtml(containerReturnReceiptId: number) {
    if (!this.mbnReportServiceApiKey()) {
      this.toastService.openToast('API Key is missing.');
      return;
    }

    this.statusSubject.next('fetching');
    this.requestErrorSubject.next(null);

    const url = `${environment.azureReportServiceBaseUrl}html/container/receipt/${containerReturnReceiptId}`;
    const headers = {
      'apiKey': this.mbnReportServiceApiKey()!
    }

    this.httpClient.get<string>(
      url, { headers: headers, responseType: 'text' as 'json' }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        this.statusSubject.next('error');
        this.requestErrorSubject.next(error);
        this.toastService.openToast('Failed to fetch container return receipt report');
        return throwError(() => error);
      })
    ).subscribe({
      next: (html: string) => {
        this.containerReturnReceiptReportHtmlSubject.next(html);
        this.statusSubject.next('stable');
      }
    });
  }

  getContainerReturnReceiptReportPdf(containerReturnReceiptId: number, action: 'download' | 'preview') {
    if (!this.mbnReportServiceApiKey()) {
      this.toastService.openToast('API Key is missing.');
    }

    this.statusSubject.next('fetching');
    this.requestErrorSubject.next(null);

    const headers = {
      'apiKey': this.mbnReportServiceApiKey()!
    };

    return this.httpClient.get(
      `${environment.azureReportServiceBaseUrl}pdf/${action}/container/receipt/${containerReturnReceiptId}`,
      { 
        headers: headers,
        responseType: 'blob'
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        this.statusSubject.next('error');
        this.requestErrorSubject.next(error);
        this.toastService.openToast('Failed to fetch container return receipt PDF');
        return throwError(() => error);
      })
    );
  }

  sendContainerReturnReceiptEmail(containerReturnReceiptId: number, emailRequest: ContainerReceiptEmailRequest) {
    if (!this.mbnReportServiceApiKey()) {
      this.toastService.openToast('API Key is missing.');
    }
    
    this.statusSubject.next('fetching');
    this.requestErrorSubject.next(null);

    const headers = {
      'apiKey': this.mbnReportServiceApiKey()!
    };

    return this.httpClient.post(
      `${environment.azureReportServiceBaseUrl}email/container/receipt/${containerReturnReceiptId}`,
      emailRequest,
      { 
        headers: headers, 
        responseType: 'text'
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        this.statusSubject.next('error');
        this.requestErrorSubject.next(error);
        this.toastService.openToast('Failed to send container return receipt email');
        return throwError(() => error);
      })
    );
  }
}
