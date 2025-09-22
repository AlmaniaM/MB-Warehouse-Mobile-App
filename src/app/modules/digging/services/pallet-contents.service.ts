import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { environment } from '../../../../environments/environment';

export const defaultPalletContents: PalletContent = {
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
  syncId: '',
  autoTimestampInsertUTC: null,
  isDeleted: false,
  autoTimestampUpdateUTC: null
}

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

// Extended interface for display purposes with related data
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

  private palletContentsSubject: BehaviorSubject<PalletContent[]> = new BehaviorSubject<PalletContent[]>([]);
  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'>('stable');
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly palletContents: Observable<PalletContent[]> = this.palletContentsSubject.asObservable();
  public readonly status: Observable<'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getAllPalletContents() {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/warehouse/palletcontents';
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
  
  getPalletContentsForPallet(palletKey: number): PalletContent[] {
    const palletContents = this.palletContentsSubject.value.filter(palletContent => palletContent.palletKey === palletKey);
    return palletContents;
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
