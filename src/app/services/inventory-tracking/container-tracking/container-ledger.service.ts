import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';

import { ToastService } from '../../utils/toast.service';
import { environment } from '../../../../environments/environment';
import { Utils } from 'src/app/classes/utils';

export const defaultContainerLedgerEntry: ContainerLedgerEntry = {
  id: -1,
  containerTypeId: -1,
  date: new Date(),
  note: null,
  quantity: 0,
  autoTimestampInsertUTC: null,
  autoTimestampUpdateUTC: null
}

export interface ContainerLedgerEntry {
  [key: string]: any;
  id: number;
  containerTypeId: number;
  date: Date;
  note: string | null;
  quantity: number;
  autoTimestampInsertUTC: Date | null;
  autoTimestampUpdateUTC: Date | null;
}

export const defaultCustomerContainerLedgerEntry: CustomerContainerLedgerEntry = {
  id: -1,
  containerTypeId: -1,
  date: new Date(),
  customerId: -1,
  customerRanch: null,
  customerInvoiceNumber: null,
  note: null,
  quantity: 0,
  returnReceiptId: null,
  shipmentNum: null,
  shipmentYear: null,
  autoTimestampInsertUTC: null,
  autoTimestampUpdateUTC: null
}

export interface CustomerContainerLedgerEntry {
  [key: string]: any;
  id: number;
  containerTypeId: number;
  date: Date;
  customerId: number;
  customerRanch: string | null;
  customerInvoiceNumber: string | null;
  note: string | null;
  quantity: number;
  returnReceiptId: number | null;
  shipmentNum: string | null;
  shipmentYear: number | null;
  autoTimestampInsertUTC: Date | null;
  autoTimestampUpdateUTC: Date | null;
}

export const defaultContainerLedgerTransaction: ContainerLedgerTransaction = {
  id: -1,
  containerTypeId: -1,
  quantity: 0,
  date: new Date(),
  fromType: 'MBN',
  from: 0,
  toType: null,
  to: null,
  note: null,
  customerInvoiceNumber: null,
  customerRanch: null,
  returnReceiptId: null,
  shipmentNum: null,
  shipmentYear: null
}

export interface ContainerLedgerTransaction {
  id: number;
  containerTypeId: number;
  quantity: number;
  date: Date;
  fromType: 'MBN' | 'Customer';
  //MBN=0, Customer=CustomerId
  from: number;
  toType: 'MBN' | 'Customer' | null;
  //MBN=0, Customer=CustomerId
  to: number | null;
  note: string | null;
  customerInvoiceNumber: string | null;
  customerRanch: string | null;
  returnReceiptId: number | null;
  shipmentNum: string | null;
  shipmentYear: number | null;
}

export interface ContainerTypeQuantityTotal {
  containerTypeId: number;
  containerTypeName: string;
  totalQuantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerLedgerEntryService {
  
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  private containerLedgerEntriesSubject: BehaviorSubject<ContainerLedgerEntry[]> = new BehaviorSubject<ContainerLedgerEntry[]>(<ContainerLedgerEntry[]> []);
  private customerContainerLedgerEntriesSubject: BehaviorSubject<CustomerContainerLedgerEntry[]> = new BehaviorSubject<CustomerContainerLedgerEntry[]>(<CustomerContainerLedgerEntry[]> []);
  private containerTypeQuantityTotalsSubject: BehaviorSubject<ContainerTypeQuantityTotal[]> = new BehaviorSubject<ContainerTypeQuantityTotal[]>(<ContainerTypeQuantityTotal[]> []);

  public statusSubject: BehaviorSubject<'fetching' | 'creating' | 'error' | 'stable'> = new BehaviorSubject<'fetching' | 'creating' | 'error' | 'stable'>('stable');
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly containerLedgerEntries: Observable<ContainerLedgerEntry[]> = this.containerLedgerEntriesSubject.asObservable();
  public readonly customerContainerLedgerEntries: Observable<CustomerContainerLedgerEntry[]> = this.customerContainerLedgerEntriesSubject.asObservable();
  public readonly containerTypeQuantityTotals: Observable<ContainerTypeQuantityTotal[]> = this.containerTypeQuantityTotalsSubject.asObservable();

  public readonly status: Observable<'fetching' | 'creating' | 'error' | 'stable'> = this.statusSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getContainerLedgerEntries() {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/ledger';
    this.httpClient
      .get<ContainerLedgerEntry[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.containerLedgerEntriesSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getCustomerContainerLedgerEntries() {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/customerledger';
    this.httpClient
      .get<CustomerContainerLedgerEntry[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.customerContainerLedgerEntriesSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getCustomerContainerLedgerEntriesForReturnReceipt(returnReceiptId: number) {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + `mbn/containertracking/customerledger/${returnReceiptId}`;
    this.httpClient
      .get<CustomerContainerLedgerEntry[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.customerContainerLedgerEntriesSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  getContainerTypeQuantityTotals() {
    this.statusSubject.next('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/containertypetotals';
    this.httpClient
      .get<ContainerTypeQuantityTotal[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.containerTypeQuantityTotalsSubject.next(records);
          this.statusSubject.next('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.statusSubject.next('error');
        }
      });
  }

  commitContainerLedgerTransaction(transaction: ContainerLedgerTransaction) {
    this.statusSubject.next('creating');

    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/containertracking/ledger';

    this.httpClient.post<ContainerLedgerEntry>(url, transaction)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.getContainerLedgerEntries();
          this.getCustomerContainerLedgerEntries();
          this.toastService.openToast('Ledger Transaction Successful!');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
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
