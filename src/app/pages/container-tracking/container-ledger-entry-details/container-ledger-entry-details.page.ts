import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { 
  IonContent 
} from "@ionic/angular/standalone";

import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { ContainerLedgerEntryService, ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';
import { ContainerTypeService } from 'src/app/services/inventory-tracking/sourcelists/container-type.service';

import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';

@Component({
  selector: 'app-container-ledger-entry-details',
  templateUrl: './container-ledger-entry-details.page.html',
  styleUrls: ['./container-ledger-entry-details.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent
  ]
})
export class ContainerLedgerEntryDetailsPage {

  router: Router = inject(Router);
  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);

  selectedContainerLedgerEntry: Signal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntry, { initialValue: null });
  
  constructor() { 
    if (!this.selectedContainerLedgerEntry()) { 
      this.router.navigate(['/app/container-tracking/ledger']); 
    }
  }
}