import { 
  Component, 
  inject, 
  Signal 
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

import { SelectedContainerLedgerEntryService } from 'src/app/services/cache/selected-container-ledger-entry.service';
import { ContainerLedgerEntryService, ContainerLedgerEntry, CustomerContainerLedgerEntry } from 'src/app/services/inventory-tracking/container-tracking/container-ledger.service';

@Component({
  selector: 'app-container-ledger-entry-layout',
  templateUrl: './container-ledger-entry-layout.component.html',
  styleUrls: ['./container-ledger-entry-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ]
})
export class ContainerLedgerEntryLayoutComponent  {
  
  router: Router = inject(Router);

  selectedContainerLedgerEntryService: SelectedContainerLedgerEntryService = inject(SelectedContainerLedgerEntryService);
  containerLedgerEntryService: ContainerLedgerEntryService = inject(ContainerLedgerEntryService);

  selectedContainerLedgerEntry: Signal<ContainerLedgerEntry | CustomerContainerLedgerEntry | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntry, { initialValue: null });
  selectedContainerLedgerEntryType: Signal<'Customer' | 'Internal' | null> = toSignal(this.selectedContainerLedgerEntryService.selectedContainerLedgerEntryType, { initialValue: null });

  goBack() {
    if (this.selectedContainerLedgerEntryType() === 'Customer') {
    this.selectedContainerLedgerEntryService.setContainerLedgerEntry(null);
      this.router.navigate(['/app/container-tracking/customer-ledger']);
      return;
    }
    this.selectedContainerLedgerEntryService.setContainerLedgerEntry(null);
    this.router.navigate(['/app/container-tracking/mbn-ledger']);
  }
}
