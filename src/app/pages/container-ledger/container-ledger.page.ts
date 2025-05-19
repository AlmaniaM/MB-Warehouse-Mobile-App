import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ToastController } from '@ionic/angular/standalone';

import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { ContainerLedgerEntry, ContainerTrackingService } from '../../services/container-tracking/container-tracking.service';
import { ContainerLedgerTableComponent } from '../../components/container-ledger-table/container-ledger-table.component';
import { DropdownOption, DropdownSelectComponent } from 'src/app/components/dropdown-select/dropdown-select.component';
import { LedgerEntryFabComponent } from '../../components/ledger-entry-fab/ledger-entry-fab.component';

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
    DropdownSelectComponent,
    LedgerEntryFabComponent
  ]
})
export class ContainerLedgerPage implements OnInit {
  readonly ledgerEntries = signal<ContainerLedgerEntry[]>([]);
  readonly selectedContainerTypes = signal<ContainerType[]>([]);

  readonly isLoading = computed(() => {
    if (this.containerTrackingService.isFetchingContainerLedgerEntries()) {
      return true;
    }

    if (this.containerTypeService.status() === 'fetching') {
      return true;
    }

    return false;
  });

  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    const types = this.containerTypeService.containerTypes() || [];
    return types.map(type => ({
      label: type.name,
      value: type
    }));
  });

  constructor(
    private containerTypeService: ContainerTypeService,
    private containerTrackingService: ContainerTrackingService,
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

  onContainerTypeSelect(containerType: ContainerType | ContainerType[] | null) {
    const containerTypeArray = (Array.isArray(containerType) ? containerType : [containerType])
      .filter(type => type !== null);

    this.filterLedgerByContainerType(containerTypeArray.map(type => type.id));
  }

  filterLedgerByContainerType(containerTypeIds: number[]) {
    this.containerTrackingService.getContainerLedgerEntriesWithDateRange(
      containerTypeIds,
      null,
      null,
      true
    );
  }

  refreshData() {
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
