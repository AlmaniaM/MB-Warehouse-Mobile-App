import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryListComponent } from 'src/app/components/container-tracking/container-ledger-entry-list/container-ledger-entry-list.component';

@Component({
  selector: 'app-container-ledger-entries',
  templateUrl: './container-ledger-entries.page.html',
  styleUrls: ['./container-ledger-entries.page.scss'],
  imports: [
    IonContent,
    PageTopbarComponent,
    ContentTopbarComponent,
    ContainerLedgerEntryListComponent
  ]
})
export class ContainerLedgerEntriesPage { }