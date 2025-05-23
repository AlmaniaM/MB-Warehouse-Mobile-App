import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerService } from '../source-lists/customer.service';

export interface ContainerLedgerEntry {
  id: number;
  containerTypeId: number | null;
  containerTypeName: string | null;
  date: string | null;
  note: string | null;
  quantity: number | null;
  customerName?: string | null;
  autoTimestampInsertUTC: string | null;
  autoTimestampUpdateUTC: string | null;
}

export interface ContainerLedgerTransaction {
  id: number;
  containerTypeId: number | null;
  quantity: number | null;
  date: string | null;
  fromType: string | null;
  from: number | null;
  toType: string | null;
  to: number | null;
  note: string | null;
  customerInvoiceNumber: string | null;
  customerRanch: string | null;
}

export interface CustomerContainerLedgerEntry {
  id: number;
  containerTypeId: number | null;
  containerTypeName: string | null;
  date: string | null;
  customerId: number | null;
  customerName: string | null;
  customerRanch: string | null;
  customerInvoiceNumber: string | null;
  note: string | null;
  quantity: number | null;
  containerReceiptId: number | null;
  shipmentNum: number | null;
  shipmentYear: number | null;
  autoTimestampInsertUTC?: string | null;
  autoTimestampUpdateUTC?: string | null;
}

export interface ContainerTypeQuantityTotal {
  containerTypeId: number;
  containerTypeName: string;
  totalQuantity: number;
}

// Type aliases for common parameter combinations
type FilterOptions = {
  containerTypeIds?: number[];
  customerIds?: number[];
  startDate?: string | null;
  endDate?: string | null;
  force?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ContainerTrackingService {
  readonly containerLedgerEntries = signal<ContainerLedgerEntry[]>([]);
  readonly customerContainerLedgerEntries = signal<CustomerContainerLedgerEntry[]>([]);
  readonly containerTypeQuantityTotals = signal<ContainerTypeQuantityTotal[]>([]);

  readonly isFetchingContainerLedgerEntries = signal<boolean>(false);
  readonly isFetchingCustomerContainerLedgers = signal<boolean>(false);
  readonly isFetchingContainerTypeQuantityTotals = signal<boolean>(false);

  private readonly baseUrl = `${environment.azureInventoryTrackingApiBaseUrl}mbn/containertracking`;
  private readonly httpClient = inject(HttpClient);
  private readonly customerService = inject(CustomerService);

  createContainerLedgerTransaction(transaction: ContainerLedgerTransaction): Observable<ContainerLedgerTransaction> {
    return this.httpClient.post<ContainerLedgerTransaction>(`${this.baseUrl}/ledger`, transaction);
  }

  getAllContainerLedgerEntries(force = false): void {
    if (this.containerLedgerEntries().length > 0 && !force) {
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);
    this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
      .pipe(
        catchError(error => {
          console.error('Error fetching container ledger entries:', error);
          this.isFetchingContainerLedgerEntries.set(false);
          throw error;
        })
      )
      .subscribe({
        next: entries => {
          this.containerLedgerEntries.set(entries);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: () => { }
      });
  }

  getContainerLedgerEntriesByType(containerTypeId: number, force = false): void {
    const existingEntries = this.containerLedgerEntries();
    const alreadyFiltered = existingEntries.length > 0 &&
      existingEntries.every(entry => entry.containerTypeId === containerTypeId);

    if (alreadyFiltered && !force) {
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);
    this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger/type/${containerTypeId}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching container ledger entries for type ${containerTypeId}:`, error);
          this.isFetchingContainerLedgerEntries.set(false);
          throw error;
        })
      )
      .subscribe({
        next: entries => {
          this.containerLedgerEntries.set(entries);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: () => { }
      });
  }

  getAllCustomerContainerLedgerEntries(force = false): void {
    if (this.customerContainerLedgerEntries().length > 0 && !force) {
      return;
    }

    this.isFetchingCustomerContainerLedgers.set(true);
    this.httpClient.get<CustomerContainerLedgerEntry[]>(`${this.baseUrl}/customerledger`)
      .pipe(
        catchError(error => {
          console.error('Error fetching customer container ledger entries:', error);
          this.isFetchingCustomerContainerLedgers.set(false);
          throw error;
        })
      )
      .subscribe({
        next: entries => {
          this.customerContainerLedgerEntries.set(entries);
          this.isFetchingCustomerContainerLedgers.set(false);
        },
        error: () => { }
      });
  }

  getContainerTypeQuantityTotals(force = false): void {
    if (this.containerTypeQuantityTotals().length > 0 && !force) {
      return;
    }

    this.isFetchingContainerTypeQuantityTotals.set(true);
    this.httpClient.get<ContainerTypeQuantityTotal[]>(`${this.baseUrl}/containertypetotals`)
      .pipe(
        catchError(error => {
          console.error('Error fetching container type quantity totals:', error);
          this.isFetchingContainerTypeQuantityTotals.set(false);
          throw error;
        })
      )
      .subscribe({
        next: totals => {
          this.containerTypeQuantityTotals.set(totals);
          this.isFetchingContainerTypeQuantityTotals.set(false);
        },
        error: () => { }
      });
  }

  getContainerLedgerEntriesByCustomer(customerId: number, force: boolean = false): void {
    const existingEntries = this.containerLedgerEntries();
    const customerName = this.customerService.getCustomerNameById(customerId);
    const alreadyFiltered = existingEntries.length > 0 &&
      existingEntries.every(entry => entry.customerName === customerName);

    if (alreadyFiltered && !force) {
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);

    this.fetchCustomerLedgerEntries(customerId)
      .pipe(
        catchError(error => {
          console.error(`Error fetching container ledger entries for customer ${customerId}:`, error);
          this.isFetchingContainerLedgerEntries.set(false);
          throw error;
        })
      )
      .subscribe({
        next: entries => {
          this.containerLedgerEntries.set(entries);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: () => { }
      });
  }

  getContainerLedgerEntriesWithDateRange(
    containerTypeIds: number[] = [],
    startDate: string | null = null,
    endDate: string | null = null,
    force: boolean = false
  ): void {
    if (containerTypeIds.length === 0 && !startDate && !endDate) {
      this.getAllContainerLedgerEntries(force);
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);
    this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
      .pipe(
        map(entries => {
          const filteredEntries = this.filterEntries(entries, {
            containerTypeIds,
            startDate,
            endDate
          });
          return filteredEntries;
        }),
        catchError(error => {
          console.error('Error fetching and filtering container ledger entries:', error);
          this.isFetchingContainerLedgerEntries.set(false);
          throw error;
        })
      )
      .subscribe({
        next: entries => {
          this.containerLedgerEntries.set(entries);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: () => { }
      });
  }

  previewFilteredEntriesCount(containerTypeIds: number[] = [], customerIds: number[] = []): Observable<number> {
    if (containerTypeIds.length === 0 && customerIds.length === 0) {
      return this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`).pipe(
        map(entries => entries.length),
        catchError(error => {
          console.error('Error previewing filter count:', error);
          throw error;
        })
      );
    }

    if (customerIds.length === 0) {
      return this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`).pipe(
        map(entries => this.filterEntries(entries, { containerTypeIds }).length),
        catchError(error => {
          console.error('Error previewing container type filter count:', error);
          throw error;
        })
      );
    }

    const customerObservables = customerIds.map(id => this.fetchCustomerLedgerEntries(id));

    return forkJoin(customerObservables).pipe(
      map(customerEntriesArrays => {
        let allCustomerEntries = customerEntriesArrays.flat();
        if (containerTypeIds.length > 0) {
          allCustomerEntries = this.filterEntries(allCustomerEntries, { containerTypeIds });
        }

        return allCustomerEntries.length;
      }),
      catchError(error => {
        console.error('Error previewing customer filter count:', error);
        throw error;
      })
    );
  }

  previewFilteredEntriesWithDateRange(
    containerTypeIds: number[] = [],
    startDate: string | null = null,
    endDate: string | null = null
  ): Observable<number> {
    return this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`).pipe(
      map(entries => {
        const filteredEntries = this.filterEntries(entries, {
          containerTypeIds,
          startDate,
          endDate
        });

        return filteredEntries.length;
      }),
      catchError(error => {
        console.error('Error previewing filter count:', error);
        throw error;
      })
    );
  }

  private convertToContainerLedgerEntry(entry: CustomerContainerLedgerEntry): ContainerLedgerEntry {
    return {
      id: entry.id,
      containerTypeId: entry.containerTypeId,
      containerTypeName: entry.containerTypeName,
      date: entry.date,
      note: entry.note,
      quantity: entry.quantity,
      customerName: entry.customerName,
      autoTimestampInsertUTC: entry.autoTimestampInsertUTC || null,
      autoTimestampUpdateUTC: entry.autoTimestampUpdateUTC || null
    };
  }

  private filterEntriesByDateRange(entries: ContainerLedgerEntry[], startDate: string | null, endDate: string | null): ContainerLedgerEntry[] {
    if (!startDate && !endDate) {
      return entries;
    }

    return entries.filter(entry => {
      if (!entry.date) return false;

      const entryDate = new Date(entry.date);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        return entryDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        return entryDate <= end;
      }

      return true;
    });
  }

  private filterEntriesByContainerType(entries: ContainerLedgerEntry[], containerTypeIds: number[]): ContainerLedgerEntry[] {
    if (containerTypeIds.length === 0) {
      return entries;
    }

    const containerTypeIdSet = new Set(containerTypeIds);
    return entries.filter(
      entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
    );
  }

  private filterEntries(entries: ContainerLedgerEntry[], options: FilterOptions): ContainerLedgerEntry[] {
    let filteredEntries = [...entries];
    if (options.containerTypeIds && options.containerTypeIds.length > 0) {
      filteredEntries = this.filterEntriesByContainerType(filteredEntries, options.containerTypeIds);
    }

    const startDate = options.startDate || null;
    const endDate = options.endDate || null;

    if (startDate || endDate) {
      filteredEntries = this.filterEntriesByDateRange(filteredEntries, startDate, endDate);
    }

    return filteredEntries;
  }

  private fetchCustomerLedgerEntries(customerId: number): Observable<ContainerLedgerEntry[]> {
    return this.httpClient.get<CustomerContainerLedgerEntry[]>(`${this.baseUrl}/customerledger/customer/${customerId}`)
      .pipe(
        map(entries => entries.map(entry => this.convertToContainerLedgerEntry(entry))),
        catchError(error => {
          console.error(`Error fetching customer ledger entries for customer ${customerId}:`, error);
          return of([]);
        }));
  }
}
