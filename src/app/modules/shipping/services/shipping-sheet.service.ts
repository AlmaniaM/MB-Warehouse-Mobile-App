import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const createDefaultShippingSheet: () => ShippingSheet = () => ({
  shipmentNum: 0,
  shipmentYear: new Date().getFullYear().toString(),
  customerId: null,
  shipmentDate: null,
  pullSheetId: null,
  isShipped: false,
  deleted: false,
  autoTimestampInsert: null
});

export interface ShippingSheet {
  shipmentNum: number;
  shipmentYear: string;
  customerId: number | null;
  shipmentDate: Date | null;
  pullSheetId: number | null;
  isShipped: boolean;
  deleted: boolean;
  autoTimestampInsert: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingSheetService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  public shippingSheetsSubject: BehaviorSubject<ShippingSheet[]> = new BehaviorSubject<ShippingSheet[]>([]);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);

  public readonly shippingSheets: Observable<ShippingSheet[]> = this.shippingSheetsSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();

  getAllShippingSheets() {
    const previousStatus = this.statusSubject.value;
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputs`;

    this.httpClient
      .get<ShippingSheet[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.shippingSheetsSubject.next(records);
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
  
  createShippingSheet(shippingSheet: ShippingSheet) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutput`;

    this.httpClient
      .post(url, shippingSheet, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('HTTP Error during create:', error);
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllShippingSheets();
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

  updateShippingSheet(shippingSheet: ShippingSheet) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutput`;

    this.httpClient
      .put(url, shippingSheet, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('HTTP Error during update:', error);
          throw error;
        })
      )
      .subscribe({
        next: (response: string) => {
          this.getAllShippingSheets();
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

  deleteShippingSheet(shipmentNum: number, shipmentYear: string) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutput/${shipmentNum}/${shipmentYear}`;

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllShippingSheets();
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
