import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const createDefaultPallet: () => Pallet = () => ({
  palletKey: -1,
  palletNumber: 0,
  digDate: new Date(),
  deliveryYear: new Date().getFullYear(),
  archive: false,
  autoTimestampInsertUTC: null,
  autoTimestampUpdateUTC: null
});

export interface Pallet {
  palletKey: number;
  palletNumber: number;
  digDate: Date;
  deliveryYear: number;
  archive: boolean;
  autoTimestampInsertUTC: Date | null;
  autoTimestampUpdateUTC: Date | null;
}

export interface ReceivedPallet {
  archive: boolean;
  palletKey: number;
  palletNumber: number;
  digDate: Date;
  deliveryYear: number;
  palletReceived: boolean;
  autoTimestampInsertUTC: Date | null;
  autoTimestampUpdateUTC: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class PalletService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);
  
  private justCreatedPalletsSubject: BehaviorSubject<Pallet[]> = new BehaviorSubject<Pallet[]>(<Pallet[]> []);
  public receivedPalletsSubject: BehaviorSubject<ReceivedPallet[]> = new BehaviorSubject<ReceivedPallet[]>(<ReceivedPallet[]> []);

  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public readonly receivedPallets: Observable<ReceivedPallet[]> = this.receivedPalletsSubject.asObservable();
  public readonly justCreatedPallets: Observable<Pallet[]> = this.justCreatedPalletsSubject.asObservable();
  public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getAllReceivedPallets() {
    const previousStatus = this.statusSubject.value;
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pallets/received`;

    this.httpClient
      .get<ReceivedPallet[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.receivedPalletsSubject.next(records);
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

  createPallet(pallet: Pallet) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pallet`;

    this.httpClient
      .post<Pallet>(url, pallet)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: createdPallet => {
          this.justCreatedPalletsSubject.next([createdPallet]);
          this.previousDataOperationSubject.next('created');
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
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pallet`;

    this.httpClient
      .put(url, pallet, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          // Update the local state with the updated pallet
          const currentPallets = this.receivedPalletsSubject.value;
          const index = currentPallets.findIndex(p => p.palletKey === pallet.palletKey);
          if (index >= 0) {
            // Preserve the palletReceived property from the existing pallet
            const updatedReceivedPallet: ReceivedPallet = {
              ...pallet,
              palletReceived: currentPallets[index].palletReceived
            };
            currentPallets[index] = updatedReceivedPallet;
            this.receivedPalletsSubject.next([...currentPallets]);
          }
          
          this.previousDataOperationSubject.next('updated');
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
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pallet/${palletKey}`;

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.previousDataOperationSubject.next('deleted');
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
