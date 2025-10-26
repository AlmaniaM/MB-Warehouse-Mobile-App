import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const createDefaultPullSheetDetail: () => PullSheetDetail = () => ({
  id: -1,
  pullSheetId: -1,
  ranch: null,
  varietyId: null,
  rootstockId: null,
  treeTypeId: null,
  sizeId: null,
  quantity: null,
  fieldId: null,
  warehouseAllocationId: -1,
  deleted: false,
  autoTimestampInsert: null
});

export interface PullSheetDetail {
  id: number;
  pullSheetId: number;
  ranch: string | null;
  varietyId: number | null;
  rootstockId: number | null;
  treeTypeId: number | null;
  sizeId: number | null;
  quantity: number | null;
  fieldId: number | null;
  warehouseAllocationId: number;
  deleted: boolean;
  autoTimestampInsert: Date | null;
}

export interface PullSheetDetailDisplay extends PullSheetDetail {
  varietyName?: string;
  rootstockName?: string;
  treeTypeName?: string;
  sizeName?: string;
  fieldName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PullSheetDetailService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  public pullSheetDetailsSubject: BehaviorSubject<PullSheetDetail[]> = new BehaviorSubject<PullSheetDetail[]>([]);
  private justCreatedPullSheetDetailsSubject: BehaviorSubject<PullSheetDetail[]> = new BehaviorSubject<PullSheetDetail[]>(<PullSheetDetail[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);

  public readonly pullSheetDetails: Observable<PullSheetDetail[]> = this.pullSheetDetailsSubject.asObservable();
  public readonly justCreatedPullSheetDetails: Observable<PullSheetDetail[]> = this.justCreatedPullSheetDetailsSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();

  getAllPullSheetDetails() {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetdetails`;

    this.httpClient
      .get<PullSheetDetail[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.pullSheetDetailsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getPullSheetDetailsForPullSheetMain(pullSheetId: number) {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetdetail/pullsheet/${pullSheetId}`;

    this.httpClient
      .get<PullSheetDetail[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.pullSheetDetailsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }
  
  createPullSheetDetail(pullSheetDetail: PullSheetDetail) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetdetail`;

    this.httpClient
      .post(url, pullSheetDetail, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllPullSheetDetails();
          this.previousDataOperationSubject.next('created');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updatePullSheetDetail(pullSheetDetail: PullSheetDetail) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetdetail`;

    this.httpClient
      .put(url, pullSheetDetail, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllPullSheetDetails();
          this.previousDataOperationSubject.next('updated');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'update');
          this.statusSubject.next('error');
        }
      });
  }

  deletePullSheetDetail(id: number) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/pullsheetdetail/${id}`;

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllPullSheetDetails();
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
