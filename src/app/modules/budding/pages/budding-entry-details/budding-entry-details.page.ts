import { Component, computed, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { IonContent } from '@ionic/angular/standalone';

import { SelectedPlantedRootPoolService } from '../../services/selected-planted-root-pool.service';
import { SelectedBuddingEntryService } from '../../services/selected-budding-entry.service';
import { BuddedRootPool, BuddedRootPoolService } from '../../services/budded-root-pool.service';
import { PlantedRootPool } from '../../services/planted-root-pool.service';
import { BuddedRootPoolEntry, BuddedRootPoolEntryService } from '../../services/budded-root-pool-entry.service';

import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { BuddingEntryFormComponent } from '../../components/budding-entry-form/budding-entry-form.component';

@Component({
  selector: 'app-budding-entry-details',
  templateUrl: './budding-entry-details.page.html',
  styleUrls: ['./budding-entry-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    PageTopbarComponent,
    ContentTopbarComponent,
    BuddingEntryFormComponent
  ]
})
export class BuddingEntryDetailsPage {
  
  router: Router = inject(Router);
  selectedPlantedRootPoolService: SelectedPlantedRootPoolService = inject(SelectedPlantedRootPoolService);
  selectedBuddingEntryService: SelectedBuddingEntryService = inject(SelectedBuddingEntryService);
  buddedRootPoolService: BuddedRootPoolService = inject(BuddedRootPoolService);
  buddedRootPoolEntryService: BuddedRootPoolEntryService = inject(BuddedRootPoolEntryService);

  selectedPlantedRootPool: Signal<PlantedRootPool | null> = toSignal(this.selectedPlantedRootPoolService.selectedPlantedRootPool, { initialValue: null });
  selectedBuddedRootPoolEntry: Signal<BuddedRootPoolEntry | null> = toSignal(this.selectedBuddingEntryService.selectedBuddedRootPoolEntry, { initialValue: null });
  buddedRootPools: Signal<BuddedRootPool[]> = toSignal(this.buddedRootPoolService.buddedRootPools, { initialValue: [] });
  buddedRootPoolEntries: Signal<BuddedRootPoolEntry[]> = toSignal(this.buddedRootPoolEntryService.buddedRootPoolEntries, { initialValue: [] });
  
  buddedRootPoolForBuddingEntry: Signal<BuddedRootPool | null> = computed(() => { 
    if (!this.selectedPlantedRootPool()) { return null; }
    if (!this.selectedBuddedRootPoolEntry()) { return null; }
    if (this.buddedRootPools().length === 0) { return null; }

    return this.buddedRootPools().find(buddedRootPool => buddedRootPool.id === this.selectedBuddedRootPoolEntry()!.buddedRootPoolId) || null;
  });

  updatedSelectedBuddedRootPoolEntry: Signal<BuddedRootPoolEntry | null> = computed(() => {
    if (!this.selectedBuddedRootPoolEntry()) { return null; }
    return this.buddedRootPoolEntries().find(entry => entry.id === this.selectedBuddedRootPoolEntry()!.id) || null;
  });

  buddingEntryPreviousDataOperation: Signal<"created" | "updated" | "deleted" | null> = toSignal(this.buddedRootPoolEntryService.previousDataOperationSubject, { requireSync: true });
  
  buddingEntryPreviousDataOperationEffect = effect(() => {
    if (this.buddingEntryPreviousDataOperation() !== 'deleted') { return; }
    this.selectedBuddingEntryService.setBuddedRootPoolEntry(null);
    this.router.navigate(['/app/budding/planting/budding-entries']);
  });

  justUpdatedEffect = effect(() => {
    if (!this.updatedSelectedBuddedRootPoolEntry()) { return; }
    if (this.buddingEntryPreviousDataOperation() !== 'updated') { return; }
    console.log('Budded Root Pool Entry Updated');
    this.selectedBuddingEntryService.setBuddedRootPoolEntry(this.updatedSelectedBuddedRootPoolEntry()!);
  });
}
