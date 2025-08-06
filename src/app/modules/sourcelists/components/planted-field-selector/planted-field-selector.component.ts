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

import { PlantedField, PlantedFieldService } from '../../services/planted-field.service';
@Component({
  selector: 'app-planted-field-selector',
  templateUrl: './planted-field-selector.component.html',
  styleUrls: ['./planted-field-selector.component.scss'],
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
export class PlantedFieldSelectorComponent {
  
  plantedFieldService: PlantedFieldService = inject(PlantedFieldService);
  plantedFieldServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.plantedFieldService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('PlantedField');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedPlantedFieldsChanged: OutputEmitterRef<PlantedField[]> = output<PlantedField[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  plantedFields: Signal<PlantedField[]> = toSignal(this.plantedFieldService.plantedFields, { initialValue: [] });

  filteredPlantedFields: Signal<PlantedField[]> = computed(() => {
    if (this.plantedFields().length === 0) { return []; }

    return this.plantedFields()
      .sort((a, b) => a.field.localeCompare(b.field))
      .filter(plantedField => plantedField.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedPlantedFields: WritableSignal<PlantedField[]> = signal<PlantedField[]>([]);
  selectedPlantedFieldIds: Signal<number[]> = computed(() => {
    if (this.selectedPlantedFields().length === 0) { return []; }
    return this.selectedPlantedFields().map(plantedField => plantedField.id);
  });
  
  isChecked(plantedField: PlantedField): boolean {
    return this.selectedPlantedFieldIds().includes(plantedField.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: PlantedField }>)  {

    const plantedField = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedPlantedFields.update(plantedFields => [...plantedFields, plantedField]);
      } else {
        this.selectedPlantedFields.set([plantedField]);
      }
    } else {
      this.selectedPlantedFields.update(plantedFields => plantedFields.filter(c => c.id !== plantedField.id));
    }
  }
}
