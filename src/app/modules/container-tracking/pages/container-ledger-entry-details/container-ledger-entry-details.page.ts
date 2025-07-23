import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { IonContent } from "@ionic/angular/standalone";

import { SelectedContainerLedgerEntryService } from 'src/app/modules/container-tracking/services/selected-container-ledger-entry.service';
import { ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/modules/container-tracking/services/container-ledger.service';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryFormComponent } from 'src/app/modules/container-tracking/components/container-ledger-entry-form/container-ledger-entry-form.component';

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