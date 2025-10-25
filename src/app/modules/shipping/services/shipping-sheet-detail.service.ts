import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const createDefaultShippingSheetDetail: () => ShippingSheetContent = () => ({
  id: -1,
  entryDate: null,
  varietyId: null,
  rootstockId: null,
  digTreeSizeId: null,
  plantedTypeId: null,
  quantity: null,
  shipmentNum: null,
  shipmentYear: null,
  ranch: null,
  contractEntryId: null,
  directSalesEntryId: null,
  sourceFieldId: null,
  containerTypeId: null,
  palletNumber: null,
  note: null,
  previouslyShipped: 0,
  totalShipped: 0,
  deleted: false,
  autoTimestampInsert: null
});

export interface ShippingSheetContent {
  id: number;
  entryDate: Date | null;
  varietyId: number | null;
  rootstockId: number | null;
  digTreeSizeId: number | null;
  plantedTypeId: number | null;
  quantity: number | null;
  shipmentNum: number | null;
  shipmentYear: string | null;
  ranch: string | null;
  contractEntryId: number | null;
  directSalesEntryId: number | null;
  sourceFieldId: number | null;
  containerTypeId: number | null;
  palletNumber: number | null;
  note: string | null;
  previouslyShipped: number;
  totalShipped: number;
  deleted: boolean;
  autoTimestampInsert: Date | null;
}

export interface ShippingSheetDetailDisplay extends ShippingSheetContent {
  varietyName?: string;
  rootstockName?: string;
  digTreeSizeName?: string;
  plantedTypeName?: string;
  sourceFieldName?: string;
  containerTypeName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingSheetDetailService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  public shippingSheetDetailsSubject: BehaviorSubject<ShippingSheetContent[]> = new BehaviorSubject<ShippingSheetContent[]>([]);
  private justCreatedShippingSheetDetailsSubject: BehaviorSubject<ShippingSheetContent[]> = new BehaviorSubject<ShippingSheetContent[]>(<ShippingSheetContent[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);

  public readonly shippingSheetDetails: Observable<ShippingSheetContent[]> = this.shippingSheetDetailsSubject.asObservable();
  public readonly justCreatedShippingSheetDetails: Observable<ShippingSheetContent[]> = this.justCreatedShippingSheetDetailsSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();

  getAllShippingSheetDetails() {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetails`;

    this.httpClient
      .get<ShippingSheetContent[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.shippingSheetDetailsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getShippingSheetDetailsByShipment(shipmentNum: number, shipmentYear: string) {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetails/${shipmentNum}/${shipmentYear}`;

    this.httpClient
      .get<ShippingSheetContent[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.shippingSheetDetailsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }
  
  createShippingSheetDetail(shippingSheetDetail: ShippingSheetContent) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetail`;

    this.httpClient
      .post(url, shippingSheetDetail, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllShippingSheetDetails();
          this.previousDataOperationSubject.next('created');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updateShippingSheetDetail(shippingSheetDetail: ShippingSheetContent) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetail`;

    this.httpClient
      .put(url, shippingSheetDetail, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllShippingSheetDetails();
          this.previousDataOperationSubject.next('updated');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'update');
          this.statusSubject.next('error');
        }
      });
  }

  deleteShippingSheetDetail(id: number) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetail/${id}`;

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getAllShippingSheetDetails();
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
