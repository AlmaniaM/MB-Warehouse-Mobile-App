import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerService } from '../source-lists/customer.service';

export interface ContainerLedgerEntry {
  id: number;
  containerTypeId: number | null;
  containerTypeName: string | null;
  date: string | null;
  note: string | null;
  quantity: number | null;
  balance?: number; // Added for mobile app to show running balance
  customerName?: string | null; // Added for mobile display
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
  customerName: string | null; // Added for mobile display
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

@Injectable({
  providedIn: 'root',
})
export class ContainerTrackingService {
  public readonly containerLedgerEntries = signal<ContainerLedgerEntry[]>([]);
  public readonly customerContainerLedgerEntries = signal<CustomerContainerLedgerEntry[]>([]);
  public readonly isFetchingContainerLedgerEntries = signal<boolean>(false);
  public readonly isFetchingCustomerContainerLedgers = signal<boolean>(false);
  public readonly containerTypeQuantityTotals = signal<ContainerTypeQuantityTotal[]>([]);
  public readonly isFetchingContainerTypeQuantityTotals = signal<boolean>(false);
  private readonly baseUrl: string = `${environment.azureInventoryTrackingApiBaseUrl}mbn/containertracking`;
  private readonly httpClient = inject(HttpClient);
  private readonly customerService = inject(CustomerService);

  // Create Container Ledger Transaction
  public createContainerLedgerTransaction(transaction: ContainerLedgerTransaction): Observable<ContainerLedgerTransaction> {
    return this.httpClient.post<ContainerLedgerTransaction>(`${this.baseUrl}/ledger`, transaction);
  }

  public getAllContainerLedgerEntries(force: boolean = false): void {
    // Skip HTTP request if we already have data and force is false
    if (this.containerLedgerEntries().length > 0 && !force) {
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);
    this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
      .subscribe({
        next: (entries: ContainerLedgerEntry[]) => {
          // Calculate running balance for each entry
          let balanceMap = new Map<number, number>(); // Map to track balance by containerTypeId

          const entriesWithBalance = entries.map(entry => {
            const containerTypeId = entry.containerTypeId || 0;
            const currentBalance = balanceMap.get(containerTypeId) || 0;
            const newBalance = currentBalance + (entry.quantity || 0);
            balanceMap.set(containerTypeId, newBalance);

            return {
              ...entry,
              balance: newBalance
            };
          });

          this.containerLedgerEntries.set(entriesWithBalance);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: (error) => {
          console.error('Error fetching container ledger entries:', error);
          this.isFetchingContainerLedgerEntries.set(false);
        }
      });
  }
  public getContainerLedgerEntriesByType(containerTypeId: number, force: boolean = false): void {
    // Skip HTTP request if we already have data for this container type and force is false
    const existingEntries = this.containerLedgerEntries();
    const alreadyFiltered = existingEntries.length > 0 && existingEntries.every(
      entry => entry.containerTypeId === containerTypeId
    );

    if (alreadyFiltered && !force) {
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);
    this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger/type/${containerTypeId}`)
      .subscribe({
        next: (entries: ContainerLedgerEntry[]) => {
          // Calculate running balance for each entry
          let balance = 0;
          const entriesWithBalance = entries.map(entry => {
            balance += (entry.quantity || 0);
            return {
              ...entry,
              balance: balance
            };
          });

          this.containerLedgerEntries.set(entriesWithBalance);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: (error) => {
          console.error(`Error fetching container ledger entries for type ${containerTypeId}:`, error);
          this.isFetchingContainerLedgerEntries.set(false);
        }
      });
  }
  public getAllCustomerContainerLedgerEntries(force: boolean = false): void {
    // Skip HTTP request if we already have data and force is false
    if (this.customerContainerLedgerEntries().length > 0 && !force) {
      return;
    }

    this.isFetchingCustomerContainerLedgers.set(true);
    this.httpClient.get<CustomerContainerLedgerEntry[]>(`${this.baseUrl}/customerledger`)
      .subscribe({
        next: (entries: CustomerContainerLedgerEntry[]) => {
          this.customerContainerLedgerEntries.set(entries);
          this.isFetchingCustomerContainerLedgers.set(false);
        },
        error: (error) => {
          console.error('Error fetching customer container ledger entries:', error);
          this.isFetchingCustomerContainerLedgers.set(false);
        }
      });
  }
  public getContainerTypeQuantityTotals(force: boolean = false): void {
    // Skip HTTP request if we already have data and force is false
    if (this.containerTypeQuantityTotals().length > 0 && !force) {
      return;
    }

    this.isFetchingContainerTypeQuantityTotals.set(true);
    this.httpClient.get<ContainerTypeQuantityTotal[]>(`${this.baseUrl}/containertypetotals`)
      .subscribe({
        next: (totals: ContainerTypeQuantityTotal[]) => {
          this.containerTypeQuantityTotals.set(totals);
          this.isFetchingContainerTypeQuantityTotals.set(false);
        },
        error: (error) => {
          console.error('Error fetching container type quantity totals:', error);
          this.isFetchingContainerTypeQuantityTotals.set(false);
        }
      });
  }

  public createTransaction(containerLedgerTransaction: ContainerLedgerTransaction): Observable<ContainerLedgerTransaction> {
    return this.httpClient.post<ContainerLedgerTransaction>(`${this.baseUrl}/ledger`, containerLedgerTransaction);
  } public getContainerLedgerEntriesByCustomer(customerId: number, force: boolean = false): void {
    // Skip HTTP request if we already have data for this customer and force is false
    const existingEntries = this.containerLedgerEntries();
    const customerName = this.customerService.getCustomerNameById(customerId);
    const alreadyFiltered = existingEntries.length > 0 &&
      existingEntries.every(entry => entry.customerName === customerName);

    if (alreadyFiltered && !force) {
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);
    this.httpClient.get<CustomerContainerLedgerEntry[]>(`${this.baseUrl}/customerledger/customer/${customerId}`)
      .subscribe({
        next: (entries: CustomerContainerLedgerEntry[]) => {
          // Convert CustomerContainerLedgerEntry to ContainerLedgerEntry
          const convertedEntries: ContainerLedgerEntry[] = entries.map(entry => ({
            id: entry.id,
            containerTypeId: entry.containerTypeId,
            containerTypeName: entry.containerTypeName,
            date: entry.date,
            note: entry.note,
            quantity: entry.quantity,
            customerName: entry.customerName,
            autoTimestampInsertUTC: entry.autoTimestampInsertUTC || null,
            autoTimestampUpdateUTC: entry.autoTimestampUpdateUTC || null
          }));

          // Calculate running balance for each entry
          let balanceMap = new Map<number, number>(); // Map to track balance by containerTypeId

          const entriesWithBalance = convertedEntries.map(entry => {
            const containerTypeId = entry.containerTypeId || 0;
            const currentBalance = balanceMap.get(containerTypeId) || 0;
            const newBalance = currentBalance + (entry.quantity || 0);
            balanceMap.set(containerTypeId, newBalance);

            return {
              ...entry,
              balance: newBalance
            };
          }); this.containerLedgerEntries.set(entriesWithBalance);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: (error) => {
          console.error(`Error fetching container ledger entries for customer ${customerId}:`, error);
          this.isFetchingContainerLedgerEntries.set(false);
        }
      });
  } public getContainerLedgerEntriesByMultipleFilters(containerTypeIds: number[] = [], customerIds: number[] = [], force: boolean = false): void {
    // If no filters, get all entries
    if (containerTypeIds.length === 0 && customerIds.length === 0) {
      this.getAllContainerLedgerEntries(force);
      return;
    }

    // Check if we can use cached data
    const existingEntries = this.containerLedgerEntries();

    if (!force && existingEntries.length > 0) {
      // For container type filters, check if current entries match the filter
      if (containerTypeIds.length > 0 && customerIds.length === 0) {
        const containerTypeIdSet = new Set(containerTypeIds);
        const matchesFilter = existingEntries.every(
          entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
        );

        if (matchesFilter) {
          return; // Use cached data
        }
      }

      // For customer filters, similar check
      if (customerIds.length > 0 && containerTypeIds.length === 0) {
        const customerNames = customerIds.map(id => this.customerService.getCustomerNameById(id)).filter(name => name !== null);
        const customerNameSet = new Set(customerNames);

        const matchesFilter = existingEntries.every(
          entry => entry.customerName && customerNameSet.has(entry.customerName)
        );

        if (matchesFilter) {
          return; // Use cached data
        }
      }
    }

    this.isFetchingContainerLedgerEntries.set(true);

    // If only filtering by container types, use the existing method
    if (containerTypeIds.length > 0 && customerIds.length === 0) {
      // Get all entries and filter client-side for multiple container types
      this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
        .subscribe({
          next: (entries: ContainerLedgerEntry[]) => {
            // Filter by container types
            const containerTypeIdSet = new Set(containerTypeIds);
            const filteredEntries = entries.filter(
              entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
            );

            // Calculate running balance for each entry
            const entriesWithBalance = this.calculateBalance(filteredEntries);

            // Update the signal with filtered entries
            this.containerLedgerEntries.set(entriesWithBalance);
            this.isFetchingContainerLedgerEntries.set(false);
          },
          error: (error) => {
            console.error('Error fetching and filtering container ledger entries:', error);
            this.isFetchingContainerLedgerEntries.set(false);
          }
        });
      return;
    }

    // If filtering by customers (with or without container types)
    if (customerIds.length > 0) {
      // We need to merge data from multiple endpoints
      // This is a placeholder implementation - ideally, the API would support this natively

      // Check if we're also filtering by container types
      const includeContainerFilter = containerTypeIds.length > 0;
      const containerTypeIdSet = includeContainerFilter ? new Set(containerTypeIds) : null;

      // Create an array to hold all the customer entries
      let allCustomerEntries: ContainerLedgerEntry[] = [];

      // Counter to track completed requests
      let completedRequests = 0;
      const totalRequests = customerIds.length;

      // Function to process entries after all requests complete
      const processEntries = () => {
        // Apply container type filter if needed
        if (includeContainerFilter && containerTypeIdSet) {
          allCustomerEntries = allCustomerEntries.filter(
            entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
          );
        }

        // Calculate running balance for each entry
        const entriesWithBalance = this.calculateBalance(allCustomerEntries);

        // Update the signal with filtered entries
        this.containerLedgerEntries.set(entriesWithBalance);
        this.isFetchingContainerLedgerEntries.set(false);
      };

      // Fetch entries for each customer
      customerIds.forEach(customerId => {
        this.httpClient.get<CustomerContainerLedgerEntry[]>(`${this.baseUrl}/customerledger/customer/${customerId}`)
          .subscribe({
            next: (entries: CustomerContainerLedgerEntry[]) => {
              // Convert CustomerContainerLedgerEntry to ContainerLedgerEntry
              const convertedEntries: ContainerLedgerEntry[] = entries.map(entry => ({
                id: entry.id,
                containerTypeId: entry.containerTypeId,
                containerTypeName: entry.containerTypeName,
                date: entry.date,
                note: entry.note,
                quantity: entry.quantity,
                customerName: entry.customerName,
                autoTimestampInsertUTC: entry.autoTimestampInsertUTC || null,
                autoTimestampUpdateUTC: entry.autoTimestampUpdateUTC || null
              }));

              // Add to the combined array
              allCustomerEntries = [...allCustomerEntries, ...convertedEntries];

              // Check if all requests are complete
              completedRequests++;
              if (completedRequests === totalRequests) {
                processEntries();
              }
            },
            error: (error) => {
              console.error(`Error fetching container ledger entries for customer ${customerId}:`, error);
              completedRequests++;
              if (completedRequests === totalRequests) {
                processEntries();
              }
            }
          });
      });
    }
  }

  // Helper method to calculate balance for entries
  private calculateBalance(entries: ContainerLedgerEntry[]): ContainerLedgerEntry[] {
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => {
      if (!a.date) return -1;
      if (!b.date) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Calculate running balance for each entry
    let balanceMap = new Map<number, number>(); // Map to track balance by containerTypeId

    return sortedEntries.map(entry => {
      const containerTypeId = entry.containerTypeId || 0;
      const currentBalance = balanceMap.get(containerTypeId) || 0;
      const newBalance = currentBalance + (entry.quantity || 0);
      balanceMap.set(containerTypeId, newBalance);

      return {
        ...entry,
        balance: newBalance
      };
    });
  }

  // New method to filter entries by date range
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

  // Get container ledger entries with multiple filters including date range
  public getContainerLedgerEntriesWithDateRange(
    containerTypeIds: number[] = [],
    startDate: string | null = null,
    endDate: string | null = null,
    force: boolean = false
  ): void {
    // If no filters, get all entries
    if (containerTypeIds.length === 0 && !startDate && !endDate) {
      this.getAllContainerLedgerEntries(force);
      return;
    }

    this.isFetchingContainerLedgerEntries.set(true);

    // Get all entries and filter client-side
    this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
      .subscribe({
        next: (entries: ContainerLedgerEntry[]) => {
          let filteredEntries = entries;

          // Filter by container types if needed
          if (containerTypeIds.length > 0) {
            const containerTypeIdSet = new Set(containerTypeIds);
            filteredEntries = filteredEntries.filter(
              entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
            );
          }

          // Filter by date range if needed
          filteredEntries = this.filterEntriesByDateRange(filteredEntries, startDate, endDate);

          // Calculate running balance for filtered entries
          const entriesWithBalance = this.calculateBalance(filteredEntries);

          this.containerLedgerEntries.set(entriesWithBalance);
          this.isFetchingContainerLedgerEntries.set(false);
        },
        error: (error) => {
          console.error('Error fetching and filtering container ledger entries:', error);
          this.isFetchingContainerLedgerEntries.set(false);
        }
      });
  }

  // Preview count of filtered entries with date range
  public previewFilteredEntriesWithDateRange(
    containerTypeIds: number[] = [],
    startDate: string | null = null,
    endDate: string | null = null
  ): Observable<number> {
    return new Observable<number>(observer => {
      this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
        .subscribe({
          next: (entries: ContainerLedgerEntry[]) => {
            let filteredEntries = entries;

            // Filter by container types if needed
            if (containerTypeIds.length > 0) {
              const containerTypeIdSet = new Set(containerTypeIds);
              filteredEntries = filteredEntries.filter(
                entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
              );
            }

            // Filter by date range if needed
            filteredEntries = this.filterEntriesByDateRange(filteredEntries, startDate, endDate);

            observer.next(filteredEntries.length);
            observer.complete();
          },
          error: (error) => {
            console.error('Error previewing filter count:', error);
            observer.error(error);
          }
        });
    });
  }

  // Preview count of filtered entries without changing the displayed entries
  public previewFilteredEntriesCount(containerTypeIds: number[] = [], customerIds: number[] = []): Observable<number> {
    return new Observable<number>(observer => {
      // If no filters, return total count
      if (containerTypeIds.length === 0 && customerIds.length === 0) {
        this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
          .subscribe({
            next: (entries: ContainerLedgerEntry[]) => {
              observer.next(entries.length);
              observer.complete();
            },
            error: (error) => {
              console.error('Error previewing filter count:', error);
              observer.error(error);
            }
          });
        return;
      }

      // If only filtering by container types
      if (containerTypeIds.length > 0 && customerIds.length === 0) {
        this.httpClient.get<ContainerLedgerEntry[]>(`${this.baseUrl}/ledger`)
          .subscribe({
            next: (entries: ContainerLedgerEntry[]) => {
              // Filter by container types
              const containerTypeIdSet = new Set(containerTypeIds);
              const filteredEntries = entries.filter(
                entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
              );
              observer.next(filteredEntries.length);
              observer.complete();
            },
            error: (error) => {
              console.error('Error previewing container type filter count:', error);
              observer.error(error);
            }
          });
        return;
      }

      // If filtering by customers (with or without container types)
      if (customerIds.length > 0) {
        // Check if we're also filtering by container types
        const includeContainerFilter = containerTypeIds.length > 0;
        const containerTypeIdSet = includeContainerFilter ? new Set(containerTypeIds) : null;

        // Create an array to hold all the customer entries
        let allCustomerEntries: ContainerLedgerEntry[] = [];

        // Counter to track completed requests
        let completedRequests = 0;
        const totalRequests = customerIds.length;

        // Function to process entries after all requests complete
        const processEntries = () => {
          // Apply container type filter if needed
          if (includeContainerFilter && containerTypeIdSet) {
            allCustomerEntries = allCustomerEntries.filter(
              entry => entry.containerTypeId !== null && containerTypeIdSet.has(entry.containerTypeId)
            );
          }
          observer.next(allCustomerEntries.length);
          observer.complete();
        };

        // Fetch entries for each customer
        customerIds.forEach(customerId => {
          this.httpClient.get<CustomerContainerLedgerEntry[]>(`${this.baseUrl}/customerledger/customer/${customerId}`)
            .subscribe({
              next: (entries: CustomerContainerLedgerEntry[]) => {
                // Convert CustomerContainerLedgerEntry to ContainerLedgerEntry
                const convertedEntries: ContainerLedgerEntry[] = entries.map(entry => ({
                  id: entry.id,
                  containerTypeId: entry.containerTypeId,
                  containerTypeName: entry.containerTypeName,
                  date: entry.date,
                  note: entry.note,
                  quantity: entry.quantity,
                  customerName: entry.customerName,
                  autoTimestampInsertUTC: entry.autoTimestampInsertUTC || null,
                  autoTimestampUpdateUTC: entry.autoTimestampUpdateUTC || null
                }));

                // Add to the combined array
                allCustomerEntries = [...allCustomerEntries, ...convertedEntries];

                // Check if all requests are complete
                completedRequests++;
                if (completedRequests === totalRequests) {
                  processEntries();
                }
              },
              error: (error) => {
                console.error(`Error previewing customer filter count for customer ${customerId}:`, error);
                completedRequests++;
                if (completedRequests === totalRequests) {
                  processEntries();
                }
              }
            });
        });
      }
    });
  }
}
