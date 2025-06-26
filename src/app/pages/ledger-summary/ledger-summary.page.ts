import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';

import { ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { ContainerLedgerEntry, ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { ContainerLedgerTableComponent } from '../../components/container-ledger-table/container-ledger-table.component';
import { ContainerFilterService } from '../../services/container-tracking/container-filter.service';
import { ContainerFilterComponent } from '../../components/container-filter/container-filter.component';
import { LedgerEntryFabComponent } from '../../components/ledger-entry-fab/ledger-entry-fab.component';

@Component({
  selector: 'app-ledger-summary',
  templateUrl: './ledger-summary.page.html',
  styleUrls: ['./ledger-summary.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    ContainerLedgerTableComponent,
    ContainerFilterComponent,
    LedgerEntryFabComponent
  ]
})
export class LedgerSummaryPage implements OnInit {
  readonly ledgerEntries = signal<ContainerLedgerEntry[]>([]);

  readonly isLoading = computed(() => {
    if (this.containerTrackingService.isFetchingContainerLedgerEntries()) {
      return true;
    }

    if (this.containerTypeService.status() === 'fetching') {
      return true;
    }

    return false;
  });

  readonly filteredEntriesText = computed<string>(() => {
    const entries = this.ledgerEntries();
    const containerTypes = this.containerFilterService.selectedContainerTypes();
    const dateRange = this.containerFilterService.selectedDateRange();
    const hasDateRange = !!(dateRange.startDate || dateRange.endDate);

    if (containerTypes?.length === 0 && !hasDateRange) {
      return entries.length === 1
        ? '1 entry found'
        : `${entries.length} entries found`;
    }

    const filters = [];
    if (containerTypes?.length > 0) {
      filters.push(`${containerTypes.length} container type${containerTypes.length > 1 ? 's' : ''}`);
    }
    if (hasDateRange) {
      filters.push('date range');
    }

    return `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} for ${filters.join(' and ')}`;
  });

  constructor(
    private containerTypeService: ContainerTypeService,
    private containerTrackingService: ContainerTrackingService,
    public containerFilterService: ContainerFilterService,
    private toastController: ToastController
  ) {
    effect(() => {
      const ledgerEntries = this.containerTrackingService.containerLedgerEntries();
      this.ledgerEntries.set(ledgerEntries);
    });
  }

  ngOnInit() {
    this.loadContainerTypes();
    this.loadLedgerEntries();
  }

  loadContainerTypes(force: boolean = false) {
    this.containerTypeService.getContainerTypes(force);
  }

  loadLedgerEntries(force: boolean = false) {
    this.containerTrackingService.getAllContainerLedgerEntries(force);
  }

  filterLedger(force: boolean = false) {
    const containerTypes = this.containerFilterService.selectedContainerTypes();
    const dateRange = this.containerFilterService.selectedDateRange();

    const containerTypeIds = containerTypes?.map(type => type.id) || [];
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;

    this.containerTrackingService.getContainerLedgerEntriesWithDateRange(
      containerTypeIds,
      startDate,
      endDate,
      force
    );

    this.containerFilterService.previewFilteredCount.set(null);
  }

  resetFilters() {
    this.containerFilterService.resetAllFilters();
    this.loadLedgerEntries(true);
  }

  refreshAllData() {
    this.loadContainerTypes(true);
    this.loadLedgerEntries(true);
  }

  async onLedgerEntryCreated(success: boolean) {
    if (success) {
      this.loadLedgerEntries(true);

      const toast = await this.toastController.create({
        message: 'Ledger entry created successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
  }
}
