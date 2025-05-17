import { computed, Injectable, signal } from '@angular/core';
import { ContainerType } from '../../services/inventory-tracking/container-type.service';

@Injectable({
  providedIn: 'root',
})
export class ContainerFilterService {
  readonly selectedContainerTypes = signal<ContainerType[]>([]);
  readonly selectedDateRange = signal<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null
  });

  readonly isPreviewLoading = signal<boolean>(false);
  readonly previewFilteredCount = signal<number | null>(null);
  readonly filtersChanged = computed(() => {
    this.selectedContainerTypes();
    this.selectedDateRange();
  });

  setContainerTypes(types: ContainerType[]): void {
    this.selectedContainerTypes.set(types);
  }

  clearContainerTypes(): void {
    this.selectedContainerTypes.set([]);
  }

  setDateRange(startDate: string | null, endDate: string | null): void {
    this.selectedDateRange.set({ startDate, endDate });
  }

  clearDateRange(): void {
    this.selectedDateRange.set({ startDate: null, endDate: null });
  }

  resetAllFilters(): void {
    this.clearContainerTypes();
    this.clearDateRange();
    this.previewFilteredCount.set(null);
  }

  formatContainerTypeSelection(): string {
    const types = this.selectedContainerTypes();
    if (types.length === 0) return '';
    if (types.length === 1) return types[0].name;
    return `${types.length} types selected`;
  }

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

  hasActiveFilters(): boolean {
    return this.selectedContainerTypes().length > 0 ||
      !!(this.selectedDateRange().startDate || this.selectedDateRange().endDate);
  }
}
