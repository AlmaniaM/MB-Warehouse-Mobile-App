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

import { Variety, VarietyService } from '../../services/variety.service';

@Component({
  selector: 'app-variety-selector',
  templateUrl: './variety-selector.component.html',
  styleUrls: ['./variety-selector.component.scss'],
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
export class VarietySelectorComponent {
  
  varietyService: VarietyService = inject(VarietyService);
  varietyServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.varietyService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Variety');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedVarietiesChanged: OutputEmitterRef<Variety[]> = output<Variety[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  varieties: Signal<Variety[]> = toSignal(this.varietyService.varieties, { initialValue: [] });

  filteredVarieties: Signal<Variety[]> = computed(() => {
    if (this.varieties().length === 0) { return []; }

    return this.varieties()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(variety => variety.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedVarieties: WritableSignal<Variety[]> = signal<Variety[]>([]);
  selectedVarietyIds: Signal<number[]> = computed(() => {
    if (this.selectedVarieties().length === 0) { return []; }
    return this.selectedVarieties().map(variety => variety.id);
  });

  checkboxChange(event: CustomEvent<{ checked: boolean; value: Variety }>)  {

    const variety = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedVarieties.update(varieties => [...varieties, variety]);
      } else {
        this.selectedVarieties.set([variety]);
      }
    } else {
      this.selectedVarieties.update(varieties => varieties.filter(c => c.id !== variety.id));
    }
  }
}
