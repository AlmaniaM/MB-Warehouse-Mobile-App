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
  IonText,
  IonProgressBar
} from '@ionic/angular/standalone';

import { Pallet, PalletService } from '../../services/pallet.service';

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
    IonText,
    IonProgressBar
  ]
})
export class PalletSelectorComponent {
  
  palletService: PalletService = inject(PalletService);
  palletServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.palletService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Pallet');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedPalletsChanged: OutputEmitterRef<Pallet[]> = output<Pallet[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  pallets: Signal<Pallet[]> = toSignal(this.palletService.pallets, { initialValue: [] });

  filteredPallets: Signal<Pallet[]> = computed(() => {
    if (this.pallets().length === 0) { return []; }

    return this.pallets()
      .sort((a, b) => a.palletNumber - b.palletNumber)
      .filter(pallet => !pallet.archive)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        const searchTerm = this.searchFilter().trim().toLowerCase();
        return (
          record.palletNumber.toString().includes(searchTerm) ||
          record.digDate.toLocaleDateString().toLowerCase().includes(searchTerm) ||
          record.deliveryYear.toString().includes(searchTerm)
        );
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedPallets: WritableSignal<Pallet[]> = signal<Pallet[]>([]);
  selectedPalletKeys: Signal<number[]> = computed(() => {
    if (this.selectedPallets().length === 0) { return []; }
    return this.selectedPallets().map(pallet => pallet.palletKey);
  });
  
  isChecked(pallet: Pallet): boolean {
    return this.selectedPalletKeys().includes(pallet.palletKey);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: Pallet }>)  {

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

}
