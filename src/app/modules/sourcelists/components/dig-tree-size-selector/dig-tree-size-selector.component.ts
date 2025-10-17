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

import { DigTreeSize, DigTreeSizeService } from '../../services/dig-tree-size.service';

@Component({
  selector: 'app-dig-tree-size-selector',
  templateUrl: './dig-tree-size-selector.component.html',
  styleUrls: ['./dig-tree-size-selector.component.scss'],
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
export class DigTreeSizeSelectorComponent {
  
  digTreeSizeService: DigTreeSizeService = inject(DigTreeSizeService);
  digTreeSizeServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.digTreeSizeService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Dig Tree Size');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedDigTreeSizesChanged: OutputEmitterRef<DigTreeSize[]> = output<DigTreeSize[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  digTreeSizes: Signal<DigTreeSize[]> = toSignal(this.digTreeSizeService.digTreeSizes, { initialValue: [] });

  filteredDigTreeSizes: Signal<DigTreeSize[]> = computed(() => {
    if (this.digTreeSizes().length === 0) { return []; }

    return this.digTreeSizes()
      .sort((a, b) => a.size.localeCompare(b.size))
      .filter(digTreeSize => digTreeSize.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedDigTreeSizes: WritableSignal<DigTreeSize[]> = signal<DigTreeSize[]>([]);
  selectedDigTreeSizeIds: Signal<number[]> = computed(() => {
    if (this.selectedDigTreeSizes().length === 0) { return []; }
    return this.selectedDigTreeSizes().map(digTreeSize => digTreeSize.id);
  });

  isChecked(digTreeSize: DigTreeSize): boolean {
    return this.selectedDigTreeSizeIds().includes(digTreeSize.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: DigTreeSize }>)  {
    const digTreeSize = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedDigTreeSizes.update(digTreeSizes => [...digTreeSizes, digTreeSize]);
      } else {
        this.selectedDigTreeSizes.set([digTreeSize]);
      }
    } else {
      this.selectedDigTreeSizes.update(digTreeSizes => digTreeSizes.filter(c => c.id !== digTreeSize.id));
    }
  }
}
