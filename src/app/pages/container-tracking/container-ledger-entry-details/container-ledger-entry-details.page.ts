import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { 
  IonContent 
} from "@ionic/angular/standalone";

import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';

import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryFormComponent } from 'src/app/components/container-tracking/container-ledger-entry-form/container-ledger-entry-form.component';

@Component({
  selector: 'app-container-ledger-entry-details',
  templateUrl: './container-ledger-entry-details.page.html',
  styleUrls: ['./container-ledger-entry-details.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent,
    ContainerLedgerEntryFormComponent
  ]
})
export class ContainerLedgerEntryDetailsPage {

  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);
  selectedContainerLedgerEntry: Signal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntry, { initialValue: null });

}