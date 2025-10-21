import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../global/classes/utils';

export const createDefaultShipSheetDetail: () => ShipSheetDetail = () => ({
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
  fieldId: null,
  containerTypeId: null,
  palletNumber: null,
  note: null,
  isShipped: null,
  previouslyShipped: null,
  totalShipped: null,
  deleted: false,
  autoTimestampInsert: null
});

export interface ShipSheetDetail {
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
  fieldId: number | null;
  containerTypeId: number | null;
  palletNumber: number | null;
  note: string | null;
  isShipped: boolean | null;
  previouslyShipped: number | null;
  totalShipped: number | null;
  deleted: boolean;
  autoTimestampInsert: Date | null;
}

export interface ShipSheetDetailDisplay extends ShipSheetDetail {
  varietyName?: string;
  rootstockName?: string;
  digTreeSizeName?: string;
  plantedTypeName?: string;
  fieldName?: string;
  containerTypeName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShipSheetDetailService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  public shipSheetDetailsSubject: BehaviorSubject<ShipSheetDetail[]> = new BehaviorSubject<ShipSheetDetail[]>([]);
  private justCreatedShipSheetDetailsSubject: BehaviorSubject<ShipSheetDetail[]> = new BehaviorSubject<ShipSheetDetail[]>(<ShipSheetDetail[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly shipSheetDetails: Observable<ShipSheetDetail[]> = this.shipSheetDetailsSubject.asObservable();
  public readonly justCreatedShipSheetDetails: Observable<ShipSheetDetail[]> = this.justCreatedShipSheetDetailsSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();

  getAllShipSheetDetails() {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetails`;

    this.httpClient
      .get<ShipSheetDetail[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.shipSheetDetailsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getShipSheetDetailsByShipment(shipmentNum: number, shipmentYear: string) {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetails/${shipmentNum}/${shipmentYear}`;

    this.httpClient
      .get<ShipSheetDetail[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.shipSheetDetailsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }
  
  createShipSheetDetail(shipSheetDetail: ShipSheetDetail) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetail`;

    this.httpClient
      .post<ShipSheetDetail>(url, shipSheetDetail)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: createdShipSheetDetail => {
          this.justCreatedShipSheetDetailsSubject.next([createdShipSheetDetail]);
          const currentDetails = this.shipSheetDetailsSubject.value;
          this.shipSheetDetailsSubject.next([...currentDetails, createdShipSheetDetail]);
          this.previousDataOperationSubject.next('created');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updateShipSheetDetail(shipSheetDetail: ShipSheetDetail) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetail`;

    this.httpClient
      .put<ShipSheetDetail>(url, shipSheetDetail)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: updatedShipSheetDetail => {
          const currentDetails = this.shipSheetDetailsSubject.value;
          const index = currentDetails.findIndex(d => d.id === shipSheetDetail.id);
          if (index >= 0) {
            currentDetails[index] = updatedShipSheetDetail || shipSheetDetail;
            this.shipSheetDetailsSubject.next([...currentDetails]);
          }
          this.previousDataOperationSubject.next('updated');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'update');
          this.statusSubject.next('error');
        }
      });
  }

  deleteShipSheetDetail(id: number) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/warehouseshipmentoutputdetail/${id}`;

    this.httpClient
      .delete(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          const currentDetails = this.shipSheetDetailsSubject.value;
          const filteredDetails = currentDetails.filter(d => d.id !== id);
          this.shipSheetDetailsSubject.next(filteredDetails);
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
    this.requestErrorSubject.next({ errorResponse: error, causedBy: cause });
    if (typeof error.error === 'string') {
      this.toastService.openToast(error.error);
      return;
    }
    this.toastService.openToast(error.message);
  }
}
