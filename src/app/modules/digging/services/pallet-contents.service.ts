import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../global/classes/utils';

export const createDefaultPalletContents: () => PalletContent = () => ({
  palletContentsKey: -1,
  palletKey: -1,
  varietyId: -1,
  rootstockId: -1,
  digTreeSizeId: -1,
  plantedTypeId: -1,
  fieldId: -1,
  quantity: 0,
  note: '',
  isReceivedWarehouse: false,
  syncId: Utils.generateUUID(36),
  autoTimestampInsertUTC: null,
  isDeleted: false,
  autoTimestampUpdateUTC: null
});

export interface PalletContent {
  palletContentsKey: number;
  palletKey: number;
  varietyId: number;
  rootstockId: number;
  digTreeSizeId: number;
  plantedTypeId: number;
  fieldId: number;
  quantity: number;
  note?: string;
  isReceivedWarehouse?: boolean;
  syncId: string;
  autoTimestampInsertUTC: Date | null;
  isDeleted: boolean;
  autoTimestampUpdateUTC: Date | null;
}

export interface PalletContentsDisplay extends PalletContent {
  varietyName?: string;
  rootstockName?: string;
  digTreeSizeName?: string;
  plantedTypeName?: string;
  fieldName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PalletContentsService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  public palletContentsSubject: BehaviorSubject<PalletContent[]> = new BehaviorSubject<PalletContent[]>([]);
  private justCreatedPalletContentsSubject: BehaviorSubject<PalletContent[]> = new BehaviorSubject<PalletContent[]>(<PalletContent[]> []);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly palletContents: Observable<PalletContent[]> = this.palletContentsSubject.asObservable();
  public readonly justCreatedPalletContents: Observable<PalletContent[]> = this.justCreatedPalletContentsSubject.asObservable();
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();

  getAllPalletContents() {
    this.statusSubject.next('fetching');
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/palletcontents`;

    this.httpClient
      .get<PalletContent[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.palletContentsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }
  
  createPalletContent(palletContent: PalletContent) {
    this.statusSubject.next('creating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/palletcontent`;

    this.httpClient
      .post<PalletContent>(url, palletContent)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: createdPalletContent => {
          this.justCreatedPalletContentsSubject.next([createdPalletContent]);
          const currentContents = this.palletContentsSubject.value;
          this.palletContentsSubject.next([...currentContents, createdPalletContent]);
          this.previousDataOperationSubject.next('created');
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.statusSubject.next('error');
        }
      });
  }

  updatePalletContent(palletContent: PalletContent) {
    this.statusSubject.next('updating');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/palletcontent`;

    this.httpClient
      .put<PalletContent>(url, palletContent)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: updatedPalletContent => {
          const currentContents = this.palletContentsSubject.value;
          const index = currentContents.findIndex(pc => pc.palletContentsKey === palletContent.palletContentsKey);
          if (index >= 0) {
            currentContents[index] = updatedPalletContent || palletContent;
            this.palletContentsSubject.next([...currentContents]);
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

  deletePalletContent(palletContentsKey: number) {
    this.statusSubject.next('deleting');
    this.previousDataOperationSubject.next(null);
    const url = `${environment.azureInventoryTrackingApiBaseUrl}mbn/warehouse/palletcontent/${palletContentsKey}`;

    this.httpClient
      .delete(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          const currentContents = this.palletContentsSubject.value;
          const filteredContents = currentContents.filter(pc => pc.palletContentsKey !== palletContentsKey);
          this.palletContentsSubject.next(filteredContents);
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
