import { 
  Component, 
  InputSignal, 
  OutputEmitterRef, 
  Signal, 
  WritableSignal, 
  computed, 
  inject, 
  input, 
  output, 
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonFooter,
  IonSearchbar,
  IonList,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonText
} from '@ionic/angular/standalone';

import { PalletService, ReceivedPallet } from 'src/app/modules/digging/services/pallet.service';

@Component({
  selector: 'app-pallet-selector',
  templateUrl: './pallet-selector.component.html',
  styleUrls: ['./pallet-selector.component.scss'],
  imports: [
    FormsModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonFooter,
    IonSearchbar,
    IonList,
    IonItem,
    IonCheckbox,
    IonLabel,
    IonText
  ]
})
export class PalletSelectorComponent {
  
  palletService: PalletService = inject(PalletService);
  palletServiceStatus: Signal<'error' | 'fetching' | 'stable' | 'creating' | 'updating' | 'deleting'> = toSignal(this.palletService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Select Pallets');
  selectMultiple: InputSignal<boolean> = input<boolean>(true);
  
  selectedPalletsChanged: OutputEmitterRef<ReceivedPallet[]> = output<ReceivedPallet[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  receivedPallets: Signal<ReceivedPallet[]> = toSignal(this.palletService.receivedPallets, { initialValue: [] });

  filteredPallets: Signal<ReceivedPallet[]> = computed(() => {
    if (this.receivedPallets().length === 0) { return []; }

    return this.receivedPallets()
      .sort((a, b) => b.palletNumber - a.palletNumber) // Sort by pallet number descending (newest first)
      .filter(pallet => !pallet.archive) // Only show non-archived pallets
      .filter(pallet => {
        if (this.searchFilter() === '') { return true; }
        const searchTerm = this.searchFilter().trim().toLowerCase();
        return (
          pallet.palletNumber.toString().includes(searchTerm) ||
          pallet.digDate.toLocaleDateString().toLowerCase().includes(searchTerm) ||
          pallet.deliveryYear.toString().includes(searchTerm)
        );
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedPallets: WritableSignal<ReceivedPallet[]> = signal<ReceivedPallet[]>([]);
  selectedPalletKeys: Signal<number[]> = computed(() => {
    if (this.selectedPallets().length === 0) { return []; }
    return this.selectedPallets().map(pallet => pallet.palletKey);
  });

  isChecked(pallet: ReceivedPallet): boolean {
    return this.selectedPalletKeys().includes(pallet.palletKey);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: ReceivedPallet }>) {
    const pallet = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedPallets.update(pallets => [...pallets, pallet]);
      } else {
        this.selectedPallets.set([pallet]);
      }
    } else {
      this.selectedPallets.update(pallets => pallets.filter(p => p.palletKey !== pallet.palletKey));
    }
  }

  constructor() {
    // Fetch pallet data when component initializes
    this.palletService.getAllReceivedPallets();
  }
}
