import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const createDefaultPullSheetMain: () => PullSheetMain = () => ({
  id: 0,
  pullSheetNumber: '',
  customerId: 0,
  pickupDate: new Date(),
  specialInstructions: null,
  versionNumber: 1,
  orderFullyShipped: false,
  deleted: false,
  autoTimestampInsert: null,
  isSubmitted: false,
  autoTimestampUpdate: null
});

export interface PullSheetMain {
  id: number;
  pullSheetNumber: string;
  customerId: number;
  pickupDate: Date;
  specialInstructions: string | null;
  versionNumber: number;
  orderFullyShipped: boolean;
  deleted: boolean;
  autoTimestampInsert: Date | null;
  isSubmitted: boolean;
  autoTimestampUpdate: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class PullSheetMainService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  public pullSheetMainsSubject: BehaviorSubject<PullSheetMain[]> = new BehaviorSubject<PullSheetMain[]>([]);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);

  public readonly pullSheetMains: Observable<PullSheetMain[]> = this.pullSheetMainsSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();

  getAllPullSheetMains() {
    const previousStatus = this.statusSubject.value;
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetmains`;

    this.httpClient
      .get<PullSheetMain[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.pullSheetMainsSubject.next(records);
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
  
  createPullSheetMain(pullSheetMain: PullSheetMain) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetmain`;

    this.httpClient
      .post(url, pullSheetMain, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('HTTP Error during create:', error);
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllPullSheetMains();
          this.previousDataOperationSubject.next('created');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Create failed:', error);
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updatePullSheetMain(pullSheetMain: PullSheetMain) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetmain`;

    this.httpClient
      .put(url, pullSheetMain, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('HTTP Error during update:', error);
          throw error;
        })
      )
      .subscribe({
        next: (response: string) => {
          this.getAllPullSheetMains();
          this.previousDataOperationSubject.next('updated');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Update failed:', error);
          this.registerRequestError(error, 'update');
          this.statusSubject.next('error');
        }
      });
  }

  deletePullSheetMain(id: number) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetmain/${id}`;

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllPullSheetMains();
          this.previousDataOperationSubject.next('deleted');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'delete');
          this.statusSubject.next('error');
        }
      });
  }

  registerRequestError(error: HttpErrorResponse, cause: 'get' | 'create' | 'update' | 'delete') {
    if (typeof error.error === 'string') {
      this.toastService.openToast(error.error);
      return;
    }
    this.toastService.openToast(error.message);
  }
}
