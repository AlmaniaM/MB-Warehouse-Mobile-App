import { Component, computed, effect, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ToastController } from '@ionic/angular/standalone';

import { ContainerType, ContainerTypeService } from '../../../services/inventory-tracking/container-type.service';
import { ContainerLedgerEntry, ContainerTrackingService } from '../../../services/container-tracking/container-tracking.service';
import { ContainerLedgerTableComponent } from '../components/container-ledger-table/container-ledger-table.component';
import { LedgerEntryFabComponent } from '../components/ledger-entry-fab/ledger-entry-fab.component';

@Component({
  selector: 'app-container-ledger',
  templateUrl: './container-ledger.page.html',
  styleUrls: ['./container-ledger.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    ContainerLedgerTableComponent,
    LedgerEntryFabComponent
  ]
})
export class ContainerLedgerPage implements OnInit {
  private readonly containerTypeService = inject(ContainerTypeService);
  private readonly containerTrackingService = inject(ContainerTrackingService);
  private readonly toastController = inject(ToastController);

  readonly ledgerEntries = signal<ContainerLedgerEntry[]>([]);
  readonly isLoading = computed(() =>
    this.containerTrackingService.isFetchingContainerLedgerEntries() ||
    this.containerTypeService.status() === 'fetching'
  );

  constructor() {
    effect(() => {
      const ledgerEntries = this.containerTrackingService.containerLedgerEntries();
      this.ledgerEntries.set(ledgerEntries);
    });
  }

  ngOnInit() {
    this.loadContainerTypes();
    this.loadLedgerEntries();
  }

  loadContainerTypes(force: boolean = false): void {
    this.containerTypeService.getContainerTypes(force);
  }

  loadLedgerEntries(force: boolean = false): void {
    this.containerTrackingService.getAllContainerLedgerEntries(force);
  }

  onContainerTypeSelect(containerTypes: ContainerType[]): void {
    if (!containerTypes || containerTypes.length === 0) {
      this.loadLedgerEntries(true);
      return;
    }

    const containerTypeIds = containerTypes.map(type => type.id);
    this.filterLedgerByContainerType(containerTypeIds);
  }

  filterLedgerByContainerType(containerTypeIds: number[]): void {
    this.containerTrackingService.getContainerLedgerEntriesWithDateRange(
      containerTypeIds,
      null,
      null,
      true
    );
  }

  refreshData(): void {
    this.loadContainerTypes(true);
    this.loadLedgerEntries(true);
  }

  async onLedgerEntryCreated(success: boolean): Promise<void> {
    if (success) {
      this.loadLedgerEntries(true);

      const toast = await this.toastController.create({
        message: 'Ledger entry created successfully',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }
}
