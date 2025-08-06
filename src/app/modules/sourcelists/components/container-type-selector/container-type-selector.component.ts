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

import { ContainerType, ContainerTypeService } from '../../services/container-type.service';

@Component({
  selector: 'app-container-type-selector',
  templateUrl: './container-type-selector.component.html',
  styleUrls: ['./container-type-selector.component.scss'],
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
export class ContainerTypeSelectorComponent {
  
  containerTypeService: ContainerTypeService = inject(ContainerTypeService);
  containerTypeServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.containerTypeService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('ContainerType');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedContainerTypesChanged: OutputEmitterRef<ContainerType[]> = output<ContainerType[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  containerTypes: Signal<ContainerType[]> = toSignal(this.containerTypeService.containerTypes, { initialValue: [] });

  filteredContainerTypes: Signal<ContainerType[]> = computed(() => {
    if (this.containerTypes().length === 0) { return []; }

    return this.containerTypes()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(containerType => containerType.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedContainerTypes: WritableSignal<ContainerType[]> = signal<ContainerType[]>([]);
  selectedContainerTypeIds: Signal<number[]> = computed(() => {
    if (this.selectedContainerTypes().length === 0) { return []; }
    return this.selectedContainerTypes().map(containerType => containerType.id);
  });
  
  isChecked(containerType: ContainerType): boolean {
    return this.selectedContainerTypeIds().includes(containerType.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: ContainerType }>)  {

    const containerType = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedContainerTypes.update(containerTypes => [...containerTypes, containerType]);
      } else {
        this.selectedContainerTypes.set([containerType]);
      }
    } else {
      this.selectedContainerTypes.update(containerTypes => containerTypes.filter(c => c.id !== containerType.id));
    }
  }
}