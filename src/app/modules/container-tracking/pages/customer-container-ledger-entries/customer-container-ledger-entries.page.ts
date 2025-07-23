import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { ContainerLedgerEntryListComponent } from 'src/app/modules/container-tracking/components/container-ledger-entry-list/container-ledger-entry-list.component';

@Component({
  selector: 'app-customer-container-ledger-entries',
  templateUrl: './customer-container-ledger-entries.page.html',
  styleUrls: ['./customer-container-ledger-entries.page.scss'],
  imports: [
    IonContent,
    PageTopbarComponent,
    ContentTopbarComponent,
    ContainerLedgerEntryListComponent
  ]
})
export class CustomerContainerLedgerEntriesPage { }
