import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonBadge,
  IonIcon,
  IonDatetime,
  IonModal,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  refreshOutline,
  filterOutline,
  searchOutline,
  calendarOutline,
  chevronDownOutline,
  syncOutline
} from 'ionicons/icons';

import { ContainerType, ContainerTypeService } from '../../../../services/inventory-tracking/container-type.service';
import { ContainerFilterService } from '../../../../services/container-tracking/container-filter.service';
import { ContainerTrackingService } from '../../../../services/container-tracking/container-tracking.service';
import { DropdownSelectComponent, DropdownOption } from '../../../../components/dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-container-filter',
  templateUrl: './container-filter.component.html',
  styleUrls: ['./container-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonBadge,
    IonIcon,
    IonDatetime,
    IonModal,
    IonLabel,
    DropdownSelectComponent
  ]
})
export class ContainerFilterComponent {
  // Injections
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly containerFilterService = inject(ContainerFilterService);

  readonly applyFilters = output<void>();
  readonly resetFilters = output<void>();
  readonly refreshData = output<void>();

  readonly selectedContainerTypes = this.containerFilterService.selectedContainerTypes;
  readonly previewFilteredCount = this.containerFilterService.previewFilteredCount;
  readonly selectedDateRange = this.containerFilterService.selectedDateRange;
  readonly isStartDateOpen = signal<boolean>(false);
  readonly isEndDateOpen = signal<boolean>(false);

  readonly isLoading = computed(() => this.containerTypeService.status() === 'fetching');
  readonly isPreviewLoading = computed(() => this.containerFilterService.isPreviewLoading());
  readonly containerTypesText = computed(() => this.containerFilterService.formatContainerTypeSelection());
  readonly dateRangeText = computed(() => this.containerFilterService.formatDateRange());
  readonly hasActiveFilters = computed(() => this.containerFilterService.hasActiveFilters());
  readonly filterBadgeCount = computed(() => {
    let count = 0;
    if (this.selectedContainerTypes().length > 0) count++;
    if (this.selectedDateRange().startDate || this.selectedDateRange().endDate) count++;
    return count;
  });

  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    const types = this.containerTypeService.containerTypes() || [];
    return types.map(type => ({
      label: type.name,
      value: type
    }));
  });

  constructor() {
    addIcons({
      'close-circle-outline': closeCircleOutline,
      'refresh-outline': refreshOutline,
      'filter-outline': filterOutline,
      'search-outline': searchOutline,
      'calendar-outline': calendarOutline,
      'chevron-down-outline': chevronDownOutline,
      'sync-outline': syncOutline,
    });

    effect(() => {
      this.containerFilterService.filtersChanged();
      this.updateFilterPreview();
    });
  }

  onContainerTypeSelectionChange(selection: ContainerType | ContainerType[] | null): void {
    this.containerFilterService.setContainerTypes(
      Array.isArray(selection) ? selection : (selection ? [selection] : [])
    );
  }

  onStartDateChange(event: any): void {
    const date = event.detail.value;
    const currentRange = this.selectedDateRange();
    this.containerFilterService.setDateRange(date, currentRange.endDate);
    this.isStartDateOpen.set(false);
  }

  onEndDateChange(event: any): void {
    const date = event.detail.value;
    const currentRange = this.selectedDateRange();
    this.containerFilterService.setDateRange(currentRange.startDate, date);
    this.isEndDateOpen.set(false);
  }

  clearContainerTypes(): void {
    this.containerFilterService.clearContainerTypes();
  }

  clearDateRange(): void {
    this.containerFilterService.clearDateRange();
  }

  onResetFilters(): void {
    this.containerFilterService.resetAllFilters();
    this.resetFilters.emit();
  }

  onApplyFilters(): void {
    this.containerFilterService.previewFilteredCount.set(null);
    this.applyFilters.emit();
  }

  onRefreshData(): void {
    this.refreshData.emit();
  }

  private updateFilterPreview(): void {
    const containerTypes = this.selectedContainerTypes();
    const dateRange = this.selectedDateRange();
    const hasActiveFilters = containerTypes.length > 0 || dateRange.startDate || dateRange.endDate;

    if (!hasActiveFilters) {
      this.containerFilterService.previewFilteredCount.set(null);
      return;
    }

    this.containerFilterService.isPreviewLoading.set(true);
    this.containerTrackingService.previewFilteredEntriesWithDateRange(
      containerTypes.map(type => type.id),
      dateRange.startDate,
      dateRange.endDate
    ).subscribe({
      next: (count) => {
        this.containerFilterService.previewFilteredCount.set(count);
        this.containerFilterService.isPreviewLoading.set(false);
      },
      error: (error) => {
        console.error('Error getting preview count:', error);
        this.containerFilterService.isPreviewLoading.set(false);
        this.containerFilterService.previewFilteredCount.set(null);
      }
    });
  }
}
