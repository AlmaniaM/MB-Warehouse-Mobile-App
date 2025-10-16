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
  IonCheckbox
} from '@ionic/angular/standalone';

import { Rootstock, RootstockService } from '../../services/rootstock.service';

@Component({
  selector: 'app-rootstock-selector',
  templateUrl: './rootstock-selector.component.html',
  styleUrls: ['./rootstock-selector.component.scss'],
  imports: [
    FormsModule,
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
    IonCheckbox
  ]
})
export class RootstockSelectorComponent {
  
  rootstockService: RootstockService = inject(RootstockService);
  rootstockServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.rootstockService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Rootstock');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedRootstocksChanged: OutputEmitterRef<Rootstock[]> = output<Rootstock[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  rootstocks: Signal<Rootstock[]> = toSignal(this.rootstockService.rootstocks, { initialValue: [] });

  filteredRootstocks: Signal<Rootstock[]> = computed(() => {
    if (this.rootstocks().length === 0) { return []; }

    return this.rootstocks()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(rootstock => rootstock.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedRootstocks: WritableSignal<Rootstock[]> = signal<Rootstock[]>([]);
  selectedRootstockIds: Signal<number[]> = computed(() => {
    if (this.selectedRootstocks().length === 0) { return []; }
    return this.selectedRootstocks().map(rootstock => rootstock.id);
  });

  isChecked(rootstock: Rootstock): boolean {
    return this.selectedRootstockIds().includes(rootstock.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: Rootstock }>)  {
    const rootstock = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedRootstocks.update(rootstocks => [...rootstocks, rootstock]);
      } else {
        this.selectedRootstocks.set([rootstock]);
      }
    } else {
      this.selectedRootstocks.update(rootstocks => rootstocks.filter(c => c.id !== rootstock.id));
    }
  }
}
