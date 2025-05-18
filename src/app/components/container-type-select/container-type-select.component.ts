import { Component, computed, inject, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerType, ContainerTypeService } from '../../services/inventory-tracking/container-type.service';
import { DropdownOption, DropdownSelectComponent } from '../dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-container-type-select',
  templateUrl: './container-type-select.component.html',
  styleUrls: ['./container-type-select.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DropdownSelectComponent
  ]
})
export class ContainerTypeSelectComponent {
  private readonly containerTypeService = inject(ContainerTypeService);

  readonly selectedContainerTypes = model<ContainerType[]>([]);
  readonly selectionChange = output<ContainerType[]>();

  readonly isLoading = computed(() => this.containerTypeService.status() === 'fetching');

  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    const types = this.containerTypeService.containerTypes() || [];
    return types.map(type => ({
      label: type.name,
      value: type
    }));
  });

  constructor() {
    this.containerTypeService.getContainerTypes();
  }

  onSelectionChange(selection: ContainerType | ContainerType[] | null): void {
    if (selection) {
      const types = Array.isArray(selection) ? selection : [selection];
      this.selectedContainerTypes.set(types);
      this.selectionChange.emit(types);
    } else {
      this.selectedContainerTypes.set([]);
      this.selectionChange.emit([]);
    }
  }
}
