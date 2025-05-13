import { Component, forwardRef, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownSelectComponent),
      multi: true
    }
  ]
})
export class DropdownSelectComponent<T> implements ControlValueAccessor {
  // Input signals
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select an option');
  readonly options = input<DropdownOption<T>[]>([]);
  readonly multiple = input<boolean>(false);
  readonly interface = input<'action-sheet' | 'alert' | 'popover'>('popover');
  readonly allowNullOption = input<boolean>(true);
  readonly nullOptionLabel = input<string>('All');
  readonly disabled = input<boolean>(false);

  // Output signals
  readonly selectionChange = output<T | T[] | null>();

  // Internal state as signals
  readonly selectedValue = signal<T | T[] | null>(null);

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor() {}

  writeValue(value: T | T[] | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Note: Can't set the value of an input signal directly
    // However, the HTML template will respect the disabled() signal value
  }

  handleChange(event: any): void {
    const value = event.detail.value;
    this.selectedValue.set(value);
    this.onChange(value);
    this.onTouched();
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
