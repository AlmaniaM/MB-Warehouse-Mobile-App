import { Injectable, signal } from '@angular/core';
import { ContainerType } from '../../services/inventory-tracking/container-type.service';
import { Customer } from '../../services/source-lists/customer.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContainerFilterService {
  // Global filter state signals
  readonly selectedContainerTypes = signal<ContainerType[]>([]);
  readonly selectedDateRange = signal<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null
  });

  // Filter preview status
  readonly isPreviewLoading = signal<boolean>(false);
  readonly previewFilteredCount = signal<number | null>(null);

  // Filter change subject for debouncing
  readonly filterChangeSubject = new Subject<void>();

  // Set container type filter
  setContainerTypes(types: ContainerType[]): void {
    this.selectedContainerTypes.set(types);
    this.triggerFilterChange();
  }

  // Clear container types
  clearContainerTypes(): void {
    this.selectedContainerTypes.set([]);
    this.triggerFilterChange();
  }

  // Set date range
  setDateRange(startDate: string | null, endDate: string | null): void {
    this.selectedDateRange.set({ startDate, endDate });
    this.triggerFilterChange();
  }

  // Clear date range
  clearDateRange(): void {
    this.selectedDateRange.set({ startDate: null, endDate: null });
    this.triggerFilterChange();
  }

  // Reset all filters
  resetAllFilters(): void {
    this.clearContainerTypes();
    this.clearDateRange();
    this.previewFilteredCount.set(null);
  }

  // Trigger filter change subject
  triggerFilterChange(): void {
    this.filterChangeSubject.next();
  }

  // Helper method to format container type selection for display
  formatContainerTypeSelection(): string {
    const types = this.selectedContainerTypes();
    if (types.length === 0) return '';
    if (types.length === 1) return types[0].name;
    return `${types.length} types selected`;
  }

  // Helper method to format date range for display
  formatDateRange(): string {
    const { startDate, endDate } = this.selectedDateRange();
    if (!startDate && !endDate) return '';

    let formattedText = '';

    if (startDate) {
      const start = new Date(startDate);
      formattedText += start.toLocaleDateString();
    } else {
      formattedText += 'Any date';
    }

    formattedText += ' to ';

    if (endDate) {
      const end = new Date(endDate);
      formattedText += end.toLocaleDateString();
    } else {
      formattedText += 'any date';
    }

    return formattedText;
  }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return this.selectedContainerTypes().length > 0 ||
      !!(this.selectedDateRange().startDate || this.selectedDateRange().endDate);
  }
}
