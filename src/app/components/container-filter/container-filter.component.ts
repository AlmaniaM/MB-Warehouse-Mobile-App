import { Component, EventEmitter, OnDestroy, OnInit, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonBadge,
  IonChip,
  IonIcon,
  IonSpinner,
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

import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { ContainerFilterService } from '../../services/container-tracking/container-filter.service';
import { ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { DropdownSelectComponent, DropdownOption } from '../dropdown-select/dropdown-select.component';
import { debounceTime, Subscription } from 'rxjs';

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
    IonChip,
    IonIcon,
    IonSpinner,
    IonDatetime,
    IonModal,
    IonLabel,
    DropdownSelectComponent
  ]
})
export class ContainerFilterComponent implements OnInit, OnDestroy {
  @Output() applyFilters = new EventEmitter<void>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() refreshData = new EventEmitter<void>();

  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly containerFilterService = inject(ContainerFilterService);

  readonly isLoading = computed(() => this.containerTypeService.status() === 'fetching');
  readonly isPreviewLoading = computed(() => this.containerFilterService.isPreviewLoading());
  readonly selectedContainerTypes = this.containerFilterService.selectedContainerTypes;
  readonly previewFilteredCount = this.containerFilterService.previewFilteredCount;

  readonly selectedDateRange = this.containerFilterService.selectedDateRange;
  isStartDateOpen = false;
  isEndDateOpen = false;

  // Display selected values
  readonly containerTypesText = computed(() => this.containerFilterService.formatContainerTypeSelection());
  readonly dateRangeText = computed(() => this.containerFilterService.formatDateRange());

  // Preview filter text
  readonly previewFilterText = computed<string>(() => {
    const previewCount = this.previewFilteredCount();
    const containerTypes = this.selectedContainerTypes();
    const dateRange = this.selectedDateRange();
    const hasDateRange = !!(dateRange.startDate || dateRange.endDate);

    if (this.isPreviewLoading()) {
      return 'Calculating...';
    }

    if (previewCount === null) {
      return '';
    }

    if (containerTypes.length === 0 && !hasDateRange) {
      return '';
    }

    const filters = [];
    if (containerTypes.length > 0) {
      filters.push(`${containerTypes.length} container type${containerTypes.length > 1 ? 's' : ''}`);
    }
    if (hasDateRange) {
      filters.push('date range');
    }

    return `Will return ${previewCount} ${previewCount === 1 ? 'entry' : 'entries'} for ${filters.join(' and ')}`;
  });

  // Filtered results info
  readonly filteredResultsText = computed<string>(() => {
    // This should be provided by the parent component - can be computed differently based on the page
    return '';
  });

  // Check if any filters are active
  readonly hasActiveFilters = computed(() => this.containerFilterService.hasActiveFilters());

  // Filter badge count
  readonly filterBadgeCount = computed(() => {
    let count = 0;
    if (this.selectedContainerTypes().length > 0) count++;
    if (this.selectedDateRange().startDate || this.selectedDateRange().endDate) count++;
    return count;
  });

  private filterChangeSubscription?: Subscription;

  // Dropdown options
  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    const types = this.containerTypeService.containerTypes() || [];
    return types.map(type => ({
      label: type.name,
      value: type
    }));
  });

  constructor() {
    // Register icons
    addIcons({
      'close-circle-outline': closeCircleOutline,
      'refresh-outline': refreshOutline,
      'filter-outline': filterOutline,
      'search-outline': searchOutline,
      'calendar-outline': calendarOutline,
      'chevron-down-outline': chevronDownOutline,
      'sync-outline': syncOutline,
    });
  }

  ngOnInit(): void {
    // Subscribe to filter changes
    this.filterChangeSubscription = this.containerFilterService.filterChangeSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.updateFilterPreview();
    });
  }

  ngOnDestroy(): void {
    if (this.filterChangeSubscription) {
      this.filterChangeSubscription.unsubscribe();
    }
  }

  // Handle container type selection change
  onContainerTypeSelectionChange(selection: ContainerType | ContainerType[] | null): void {
    if (Array.isArray(selection)) {
      this.containerFilterService.setContainerTypes(selection);
    } else {
      this.containerFilterService.setContainerTypes(selection ? [selection] : []);
    }
  }

  // Handler for date selection
  onStartDateChange(event: any): void {
    const date = event.detail.value;
    const currentRange = this.selectedDateRange();
    this.containerFilterService.setDateRange(date, currentRange.endDate);
    this.isStartDateOpen = false;
  }

  onEndDateChange(event: any): void {
    const date = event.detail.value;
    const currentRange = this.selectedDateRange();
    this.containerFilterService.setDateRange(currentRange.startDate, date);
    this.isEndDateOpen = false;
  }

  // Clear specific filters
  clearContainerTypes(): void {
    this.containerFilterService.clearContainerTypes();
  }

  clearDateRange(): void {
    this.containerFilterService.clearDateRange();
  }

  // Reset all filters
  onResetFilters(): void {
    this.containerFilterService.resetAllFilters();
    this.resetFilters.emit();
  }

  // Apply filters
  onApplyFilters(): void {
    this.containerFilterService.previewFilteredCount.set(null);
    this.applyFilters.emit();
  }

  // Refresh data
  onRefreshData(): void {
    this.refreshData.emit();
  }

  // Update filter preview
  updateFilterPreview(): void {
    const containerTypes = this.selectedContainerTypes();
    const dateRange = this.selectedDateRange();
    const hasActiveFilters = containerTypes.length > 0 ||
      (dateRange.startDate !== null || dateRange.endDate !== null);

    // Skip preview if no filters are selected
    if (!hasActiveFilters) {
      this.previewFilteredCount.set(null);
      return;
    }

    // Extract IDs for API calls
    const containerTypeIds = containerTypes.map(type => type.id);
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;

    this.containerFilterService.isPreviewLoading.set(true);

    // Use the preview method with date range
    this.containerTrackingService.previewFilteredEntriesWithDateRange(
      containerTypeIds,
      startDate,
      endDate
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
