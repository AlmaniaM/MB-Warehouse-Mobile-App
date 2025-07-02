import { 
  Component, 
  computed, 
  effect, 
  inject, 
  signal, 
  Signal, 
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonHeader,
  IonFab, 
  IonFabButton, 
  IonSelect,
  IonModal, 
  IonProgressBar,
  IonSelectOption, 
  IonText, 
  IonNote,
  IonToolbar, 
  IonSearchbar, 
  IonButton, 
  IonButtons, 
  IonTitle, IonChip } from '@ionic/angular/standalone';

import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { ContainerLedgerEntryService, ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerTypeService, ContainerType } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';

import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryFormComponent } from 'src/app/components/container-tracking/container-ledger-entry-form/container-ledger-entry-form.component';

export interface ContainerLedgerEntryListRecord {
  containerLedgerEntry: ContainerLedgerEntry;
  containerType: ContainerType;
}

@Component({
  selector: 'app-container-ledger-entries',
  templateUrl: './container-ledger-entries.page.html',
  styleUrls: ['./container-ledger-entries.page.scss'],
  imports: [IonChip, 
    IonContent,
    CommonModule,
    FormsModule,
    ScrollingModule,
    DatePipe,
    IonButtons, 
    IonButton, 
    IonTitle, 
    IonHeader, 
    IonList,
    IonItem, 
    IonIcon, 
    IonToolbar, 
    IonSearchbar, 
    IonLabel,
    IonFab, 
    IonFabButton, 
    IonSelect,
    IonModal, 
    IonProgressBar,
    IonSelectOption, 
    IonText, 
    IonNote, 
    PageTopbarComponent,
    ContentTopbarComponent,
    ContainerLedgerEntryFormComponent
  ]
})
export class ContainerLedgerEntriesPage {
  
  router: Router = inject(Router);
  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);

  containerLedgerEntryServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.containerLedgerEntryService.status, { initialValue: 'stable' });
  containerTypeServiceStatus: Signal<'fetching' | 'creating' | 'error' | 'stable'> = toSignal(this.containerLedgerEntryService.status, { initialValue: 'stable' });
  isFetchingData: Signal<boolean> = computed(() => {
    return ['fetching', 'creating'].includes(this.containerLedgerEntryServiceStatus()) || ['fetching', 'creating'].includes(this.containerTypeServiceStatus());
  });

  selectedContainerLedgerEntry: Signal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntry, { initialValue: null });
  selectedContainerLedgerEntryEffect = effect(() => { 
    if (!this.selectedContainerLedgerEntry()) { return; }
    this.router.navigate(['/app/container-tracking/ledger-entry-details']);
  });

  containerLedgerEntries: Signal<ContainerLedgerEntry[]> = toSignal(this.containerLedgerEntryService.containerLedgerEntries, { initialValue: [] });
  containerTypes: Signal<ContainerType[]> = toSignal(this.containerTypeService.containerTypes, { initialValue: [] });

  containerLedgerEntryYears: Signal<number[]> = computed(() => {
    if (this.containerLedgerEntries().length === 0) { return []; }

    return Array.from(new Set(
      this.containerLedgerEntries().map((entry) => new Date(entry.date).getFullYear())
    )).sort((a, b) => b - a);
  });

  containerLedgerEntryListRecords: Signal<ContainerLedgerEntryListRecord[]> = computed(() => { 
    if (this.containerLedgerEntries().length === 0) { return []; }
    if (this.containerTypes().length === 0) { return []; }

    return this.containerLedgerEntries().map((ledgerEntry) => { 
      return {
        containerLedgerEntry: ledgerEntry,
        containerType: this.containerTypes().find((containerType) => containerType.id === ledgerEntry.containerTypeId)!
      }
    });
  });

  globalSearchFilter: WritableSignal<string> = signal('');
  yearFilter: WritableSignal<number> = signal(new Date().getFullYear());
  entryTypeFilter: WritableSignal<'add' | 'subtract' | null> = signal(null);
  containerTypeFilter: WritableSignal<ContainerType | null> = signal(null);
  isCreatingLedgerEntry: WritableSignal<boolean> = signal(false);

  filteredContainerLedgerEntryListRecords: Signal<ContainerLedgerEntryListRecord[]> = computed(() => { 
    return this.containerLedgerEntryListRecords()
      .sort((a, b) => {
        return new Date(b.containerLedgerEntry.date).getTime() - new Date(a.containerLedgerEntry.date).getTime();
      })
      .filter((ledgerEntry) => { 
        return new Date(ledgerEntry.containerLedgerEntry.date).getFullYear() === this.yearFilter();
      })
      .filter((ledgerEntry) => { 
        if (this.globalSearchFilter() === '') { return true; } 
        return JSON.stringify(ledgerEntry).trim().toLowerCase().includes(this.globalSearchFilter().trim().toLowerCase());  
      })
      .filter((ledgerEntry) => { 
        if (!this.entryTypeFilter()) { return true; }
        if (this.entryTypeFilter() === 'add') { 
          return ledgerEntry.containerLedgerEntry.quantity > 0;
        } 
        return ledgerEntry.containerLedgerEntry.quantity < 0;
      })
      .filter((ledgerEntry) => { 
        if (!this.containerTypeFilter()) { return true; }
        return ledgerEntry.containerType.id === this.containerTypeFilter()!.id;
      })
  });

  trackByContainerLedgerEntry(index: number, ledgerEntry: ContainerLedgerEntryListRecord) { 
    return ledgerEntry.containerLedgerEntry.id;
  }

  setSelectedContainerLedgerEntry(ledgerEntry: ContainerLedgerEntryListRecord) { 
    this.selectedContainerLedgerEntryService.setContainerLedgerEntry(ledgerEntry.containerLedgerEntry);
  }
}