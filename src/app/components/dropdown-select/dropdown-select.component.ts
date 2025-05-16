import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

export interface DropdownOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption
  ]
})
export class DropdownSelectComponent<T> {
  // Input signals
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select an option');
  readonly options = input<DropdownOption<T>[]>([]);
  readonly multiple = input<boolean>(false);
  readonly interface = input<'action-sheet' | 'alert' | 'popover'>('popover');
  readonly allowNullOption = input<boolean>(true);
  readonly nullOptionLabel = input<string>('All');
  readonly disabled = input<boolean>(false);

  // Model signal for two-way binding
  readonly selectedValue = model<T | T[] | null>(null);

  // Output signals
  readonly selectionChange = output<T | T[] | null>();

  handleChange(event: any): void {
    const value = event.detail.value;
    this.selectedValue.set(value);
    this.selectionChange.emit(value);
  }

  compareWith(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (typeof o1 === 'object' && typeof o2 === 'object') {
      // Check if objects have an id property to compare
      if ('id' in o1 && 'id' in o2) {
        return o1.id === o2.id;
      }
      // Use JSON.stringify for object comparison as a fallback
      return JSON.stringify(o1) === JSON.stringify(o2);
    }

    return o1 === o2;
  }
}
