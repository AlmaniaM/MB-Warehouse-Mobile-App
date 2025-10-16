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

import { PlantedType, PlantedTypeService } from '../../services/planted-type.service';

@Component({
  selector: 'app-planted-type-selector',
  templateUrl: './planted-type-selector.component.html',
  styleUrls: ['./planted-type-selector.component.scss'],
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
export class PlantedTypeSelectorComponent {
  
  plantedTypeService: PlantedTypeService = inject(PlantedTypeService);
  plantedTypeServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.plantedTypeService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Planted Type');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedPlantedTypesChanged: OutputEmitterRef<PlantedType[]> = output<PlantedType[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  plantedTypes: Signal<PlantedType[]> = toSignal(this.plantedTypeService.plantedTypes, { initialValue: [] });

  filteredPlantedTypes: Signal<PlantedType[]> = computed(() => {
    if (this.plantedTypes().length === 0) { return []; }

    return this.plantedTypes()
      .sort((a, b) => a.type.localeCompare(b.type))
      .filter(plantedType => plantedType.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedPlantedTypes: WritableSignal<PlantedType[]> = signal<PlantedType[]>([]);
  selectedPlantedTypeIds: Signal<number[]> = computed(() => {
    if (this.selectedPlantedTypes().length === 0) { return []; }
    return this.selectedPlantedTypes().map(plantedType => plantedType.id);
  });

  isChecked(plantedType: PlantedType): boolean {
    return this.selectedPlantedTypeIds().includes(plantedType.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: PlantedType }>)  {
    const plantedType = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedPlantedTypes.update(plantedTypes => [...plantedTypes, plantedType]);
      } else {
        this.selectedPlantedTypes.set([plantedType]);
      }
    } else {
      this.selectedPlantedTypes.update(plantedTypes => plantedTypes.filter(c => c.id !== plantedType.id));
    }
  }
}
