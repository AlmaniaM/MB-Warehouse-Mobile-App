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

import { SelectedBuddingEntryService } from '../../services/selected-budding-entry.service';
import { BuddedRootPoolEntry } from '../../services/budded-root-pool-entry.service';

@Component({
  selector: 'app-budding-entry-layout',
  templateUrl: './budding-entry-layout.component.html',
  styleUrls: ['./budding-entry-layout.component.scss'],
  imports: [
    IonTabButton, 
    IonIcon, 
    IonTabBar, 
    IonTabs 
  ]
})
export class BuddingEntryLayoutComponent {
  
  router: Router = inject(Router);
  selectedBuddingEntryService: SelectedBuddingEntryService = inject(SelectedBuddingEntryService);
  selectedBuddedRootPoolEntry: Signal<BuddedRootPoolEntry | null> = toSignal(this.selectedBuddingEntryService.selectedBuddedRootPoolEntry, { initialValue: null });

  goBack() {
    this.selectedBuddingEntryService.setBuddedRootPoolEntry(null);
    this.router.navigate(['/app/budding/planting/budding-entries']);
  }
}
