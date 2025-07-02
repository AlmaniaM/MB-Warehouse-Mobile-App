import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from '../../utils/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/classes/utils';

export const defaultContainerReturnReceipt: ContainerReturnReceipt = {
  id: -1,
  containerReceiptReference: null,
  date: new Date(),
  customerId: -1,
  autoTimestampInsertUTC: null,
  autoTimestampUpdateUTC: null
}

export interface ContainerReturnReceipt {
  [key: string]: any;
  id: number;
  containerReceiptReference: string | null;
  date: Date;
  customerId: number;
  autoTimestampInsertUTC: Date | null;
  autoTimestampUpdateUTC: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerReturnReceiptService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  private containerReturnReceiptsSubject: BehaviorSubject<ContainerReturnReceipt[]> = new BehaviorSubject<ContainerReturnReceipt[]>(<ContainerReturnReceipt[]> []);
  private justCreatedContainerReturnReceiptsSubject: BehaviorSubject<ContainerReturnReceipt[]> = new BehaviorSubject<ContainerReturnReceipt[]>(<ContainerReturnReceipt[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly containerReturnReceipts: Observable<ContainerReturnReceipt[]> = this.containerReturnReceiptsSubject.asObservable();
  public readonly justCreatedContainerReturnReceipts: Observable<ContainerReturnReceipt[]> = this.justCreatedContainerReturnReceiptsSubject.asObservable();
  public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getContainerReturnReceipts() {
    const previousStatus = this.statusSubject.value;
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/returnreceipts';
    this.httpClient
      .get<ContainerReturnReceipt[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.containerReturnReceiptsSubject.next(records);
          if (previousStatus === 'creating') {
            this.previousDataOperationSubject.next('created');
          } else if (previousStatus === 'updating') {
            this.previousDataOperationSubject.next('updated');
          } else if (previousStatus === 'deleting') {
            this.previousDataOperationSubject.next('deleted');
          } else {
            this.previousDataOperationSubject.next(null);
          }
          
          this.justCreatedContainerReturnReceiptsSubject.next(<ContainerReturnReceipt[]> []);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  createReturnReceipts(records: ContainerReturnReceipt[]) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    let requests = new Array<Observable<any>>();

    records.forEach(record => {
      const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/returnreceipt';
      requests.push(this.httpClient.post<ContainerReturnReceipt>(url, record));
    });

    forkJoin(requests)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: (justCreatedContainerReturnReceipts) => {
          this.justCreatedContainerReturnReceiptsSubject.next(justCreatedContainerReturnReceipts);
          this.getContainerReturnReceipts();
          this.toastService.openToast(records.length > 1 ? 'All Records created.' : 'Record created.');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updateReturnReceipts(records: ContainerReturnReceipt[]) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    let requests = new Array<Observable<any>>();

    records.forEach(record => {
      const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/returnreceipt';
      requests.push(this.httpClient.put(url, record, { responseType: 'text' }));
    });

    forkJoin(requests)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getContainerReturnReceipts();
          this.toastService.openToast(records.length > 1 ? 'All Records updated.' : 'Record updated.');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'update');
          this.statusSubject.next('error');
        }
      });
  }

  deleteReturnReceipts(records: ContainerReturnReceipt[]) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    let requests = new Array<Observable<any>>();

    records.forEach(record => {
      const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/returnreceipt/' + record['id'];
      requests.push(this.httpClient.delete(url, { responseType: 'text' }));
    });

    forkJoin(requests)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getContainerReturnReceipts();
          this.toastService.openToast(records.length > 1 ? 'All Records deleted.' : 'Record deleted.');
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
