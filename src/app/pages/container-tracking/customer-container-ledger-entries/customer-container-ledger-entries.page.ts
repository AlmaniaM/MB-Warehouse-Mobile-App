import { Component } from '@angular/core';

import { 
  IonContent 
} from "@ionic/angular/standalone";

import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';

@Component({
  selector: 'app-customer-container-ledger-entries',
  templateUrl: './customer-container-ledger-entries.page.html',
  styleUrls: ['./customer-container-ledger-entries.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent
  ]
})
export class CustomerContainerLedgerEntriesPage {

}
