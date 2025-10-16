import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const defaultDigTreeSize: DigTreeSize = { 
  id: -1,
  size: '',
  active: true,
  appUser: null,
  autoTimestampInsert: null
}

export interface DigTreeSize {
  [key: string]: any;
  id: number;
  size: string;
  active: boolean;
  appUser: string | null;
  autoTimestampInsert: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class DigTreeSizeService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  private digTreeSizesSubject: BehaviorSubject<DigTreeSize[]> = new BehaviorSubject<DigTreeSize[]>(<DigTreeSize[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly digTreeSizes: Observable<DigTreeSize[]> = this.digTreeSizesSubject.asObservable();
  public readonly status: Observable<'fetching' |  'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getDigTreeSizes() {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/digtreesizes';
    this.httpClient
      .get<DigTreeSize[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.digTreeSizesSubject.next(records);
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
