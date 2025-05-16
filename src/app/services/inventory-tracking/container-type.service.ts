import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin } from 'rxjs';

import { ToastService } from '../utils/toast.service';
import { environment } from '../../../environments/environment';

export const defaultContainerType: ContainerType = {
  id: -1,
  name: '',
  active: true,
  appUser: null,
  autoTimestampInsert: null
}

export interface ContainerType {
  [key: string]: any;
  id: number;
  name: string;
  active: boolean;
  appUser: string | null;
  autoTimestampInsert: Date | null;
}

export type StatusType = 'fetching' | 'creating' | 'updating' | 'deleting' | 'error' | 'stable';

@Injectable({
  providedIn: 'root'
})
export class ContainerTypeService {
  private httpClient: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);

  private justCreatedContainerTypesSubject: BehaviorSubject<ContainerType[]> = new BehaviorSubject<ContainerType[]>(<ContainerType[]>[]);
  public previousDataOperationSubject: BehaviorSubject<'created' | 'updated' | 'deleted' | null> = new BehaviorSubject<'created' | 'updated' | 'deleted' | null>(null);
  public requestErrorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public readonly containerTypes = signal<ContainerType[]>([]);
  public readonly justCreatedContainerTypes: Observable<ContainerType[]> = this.justCreatedContainerTypesSubject.asObservable();
  public readonly status: WritableSignal<StatusType> = signal('stable');
  public readonly previousDataOperation: Observable<'created' | 'updated' | 'deleted' | null> = this.previousDataOperationSubject.asObservable();
  public readonly requestError: Observable<any> = this.requestErrorSubject.asObservable();

  getContainerTypes(force: boolean = false) {
    // Skip HTTP request if we already have data and force is false
    if (!force && this.containerTypes().length > 0) {
      return;
    }

    const previousStatus = this.status();
    this.status.set('fetching');
    const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertypes';
    this.httpClient
      .get<ContainerType[]>(url)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: records => {
          this.containerTypes.set(records);
          if (previousStatus === 'creating') {
            this.previousDataOperationSubject.next('created');
          } else if (previousStatus === 'updating') {
            this.previousDataOperationSubject.next('updated');
          } else if (previousStatus === 'deleting') {
            this.previousDataOperationSubject.next('deleted');
          } else {
            this.previousDataOperationSubject.next(null);
          }

          this.justCreatedContainerTypesSubject.next(<ContainerType[]>[]);
          this.status.set('stable');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'get');
          this.status.set('error');
        }
      });
  }

  createContainerTypes(records: ContainerType[]) {
    this.status.set('creating');
    this.previousDataOperationSubject.next(null);
    let requests = new Array<Observable<any>>();

    records.forEach(record => {
      const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertype';
      requests.push(this.httpClient.post<ContainerType>(url, record));
    });

    forkJoin(requests)
      .pipe(
        catchError(error => {
          throw error;
        })
      )
      .subscribe({
        next: (justCreatedContainerTypes) => {
          this.justCreatedContainerTypesSubject.next(justCreatedContainerTypes);
          this.getContainerTypes();
          this.toastService.openToast(records.length > 1 ? 'All Records created.' : 'Record created.');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'create');
          this.status.set('error');
        }
      });
  }

  updateContainerTypes(records: ContainerType[]) {
    this.status.set('updating');
    this.previousDataOperationSubject.next(null);
    let requests = new Array<Observable<any>>();

    records.forEach(record => {
      const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertype';
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
          this.getContainerTypes();
          this.toastService.openToast(records.length > 1 ? 'All Records updated.' : 'Record updated.');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'update');
          this.status.set('error');
        }
      });
  }

  deleteContainerTypes(records: ContainerType[]) {
    this.status.set('deleting');
    this.previousDataOperationSubject.next(null);
    let requests = new Array<Observable<any>>();

    records.forEach(record => {
      const url = environment.azureInventoryTrackingApiBaseUrl + 'mbn/sourcelists/containertype/' + record['id'];
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
          this.getContainerTypes();
          this.toastService.openToast(records.length > 1 ? 'All Records deleted.' : 'Record deleted.');
        },
        error: (error: HttpErrorResponse) => {
          this.registerRequestError(error, 'delete');
          this.status.set('error');
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
