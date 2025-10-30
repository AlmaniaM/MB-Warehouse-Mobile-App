import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const defaultPallet: Pallet = {
  palletKey: -1,
  palletNumber: 0,
  digDate: new Date(),
  deliveryYear: new Date().getFullYear(),
  archive: false,
  autoTimestampInsertUTC: null,
  autoTimestampUpdateUTC: null
}

export interface Pallet {
  [key: string]: any;
  palletKey: number;
  palletNumber: number;
  digDate: Date;
  deliveryYear: number;
  archive: boolean;
  autoTimestampInsertUTC: Date | null;
  autoTimestampUpdateUTC: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class PalletService {
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  private palletsSubject: BehaviorSubject<Pallet[]> = new BehaviorSubject<Pallet[]>(<Pallet[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'error' | 'stable'>('stable');
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly pallets: Observable<Pallet[]> = this.palletsSubject.asObservable();
  public readonly status: Observable<'fetching' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getPallets() {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/warehouse/pallets';
    this.httpClient
      .get<Pallet[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.palletsSubject.next(records);
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
