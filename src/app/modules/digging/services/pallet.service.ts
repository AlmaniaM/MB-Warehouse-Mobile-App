import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

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
  private justCreatedPalletsSubject: BehaviorSubject<Pallet[]> = new BehaviorSubject<Pallet[]>(<Pallet[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly pallets: Observable<Pallet[]> = this.palletsSubject.asObservable();
  public readonly justCreatedPallets: Observable<Pallet[]> = this.justCreatedPalletsSubject.asObservable();
  public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getAllPallets() {
    const previousStatus = this.statusSubject.value;
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
          if (previousStatus === 'creating') {
            this.previousDataOperationSubject.next('created');
          } else if (previousStatus === 'updating') {
            this.previousDataOperationSubject.next('updated');
          } else if (previousStatus === 'deleting') {
            this.previousDataOperationSubject.next('deleted');
          } else {
            this.previousDataOperationSubject.next(null);
          }
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getSinglePallet(palletKey: number) {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + `mbn/warehouse/pallet/${palletKey}`;
    this.httpClient
      .get<Pallet>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: record => {
          // Update the specific pallet in the list
          const currentPallets = this.palletsSubject.value;
          const updatedPallets = currentPallets.map(pallet => 
            pallet.palletKey === record.palletKey ? record : pallet
          );
          this.palletsSubject.next(updatedPallets);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  createPallet(pallet: Pallet) {
    this.statusSubject.next('creating');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/warehouse/pallet';
    this.httpClient
      .post<Pallet>(url, pallet)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: record => {
          const currentPallets = this.palletsSubject.value;
          this.palletsSubject.next([...currentPallets, record]);
          this.statusSubject.next('stable');
          this.toastService.openToast('Pallet created successfully!');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updatePallet(pallet: Pallet) {
    this.statusSubject.next('updating');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/warehouse/pallet';
    this.httpClient
      .put(url, pallet, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          const currentPallets = this.palletsSubject.value;
          const updatedPallets = currentPallets.map(p => 
            p.palletKey === pallet.palletKey ? pallet : p
          );
          this.palletsSubject.next(updatedPallets);
          this.statusSubject.next('stable');
          this.toastService.openToast('Pallet updated successfully!');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'update');
          this.statusSubject.next('error');
        }
      });
  }

  deletePallet(palletKey: number) {
    this.statusSubject.next('deleting');
    const url = environment.azureInventoryTrackingApiBaseUrl + `mbn/warehouse/pallet/${palletKey}`;
    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          const currentPallets = this.palletsSubject.value;
          const updatedPallets = currentPallets.filter(p => p.palletKey !== palletKey);
          this.palletsSubject.next(updatedPallets);
          this.statusSubject.next('stable');
          this.toastService.openToast('Pallet deleted successfully!');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'delete');
          this.statusSubject.next('error');
        }
      });
  }

  registerRequestError(error: HttpErrorResponse, cause: 'get' | 'create' | 'update' | 'delete') {
    this.requestErrorSubject.next({ errorResponse: error, causedBy: cause });
    if (typeof error.error === 'string') {
      this.toastService.openToast(error.error);
      return;
    }
    this.toastService.openToast(error.message);
  }
}
