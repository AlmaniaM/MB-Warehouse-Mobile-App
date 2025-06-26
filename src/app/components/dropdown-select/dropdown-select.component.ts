import { Component, computed, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonSearchbar,
  IonCheckbox
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline,
  closeOutline,
  searchOutline,
  chevronDownOutline
} from 'ionicons/icons';

export interface DropdownOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  standalone: true, imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonSearchbar,
    IonCheckbox
  ]
})
export class DropdownSelectComponent<T> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select an option');
  readonly options = input<DropdownOption<T>[]>([]);
  readonly multiple = input<boolean>(false);
  readonly allowNullOption = input<boolean>(true);
  readonly nullOptionLabel = input<string>('All');
  readonly disabled = input<boolean>(false);
  readonly enableSearch = input<boolean>(true);

  readonly selectedValue = model<T | T[] | null>(null);

  readonly selectionChange = output<T | T[] | null>();

  readonly isDropdownOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly tempSelection = signal<T | T[] | null>(null);

  readonly filteredOptions = computed<DropdownOption<T>[]>(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.options();
    }

    return this.options().filter(option =>
      option.label.toLowerCase().includes(query)
    );
  });

  constructor() {
    addIcons({
      'checkmark-outline': checkmarkOutline,
      'close-outline': closeOutline,
      'search-outline': searchOutline,
      'chevron-down-outline': chevronDownOutline
    });
  }

  openDropdown(): void {
    if (this.disabled()) {
      return;
    }

    this.tempSelection.set(this.selectedValue());
    this.isDropdownOpen.set(true);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
    this.searchQuery.set('');

    if (!this.multiple()) {
      this.confirmSelection();
    }
  }

  onSearchChange(event: any): void {
    this.searchQuery.set(event.detail.value || '');
  }

  selectItem(value: T | null, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.multiple()) {
      const currentSelection = this.tempSelection() as T[] || [];

      if (value === null) {
        this.tempSelection.set([]);
      } else {
        const valueIndex = currentSelection.findIndex(item => this.compareValues(item, value));

        if (valueIndex >= 0) {
          const newSelection = [...currentSelection];
          newSelection.splice(valueIndex, 1);
          this.tempSelection.set(newSelection);
        } else {
          this.tempSelection.set([...currentSelection, value]);
        }
      }
    } else {
      this.tempSelection.set(value);

      if (!this.multiple()) {
        this.confirmSelection();
        this.closeDropdown();
      }
    }
  }

  confirmMultiSelection(): void {
    this.confirmSelection();
    this.closeDropdown();
  }

  private confirmSelection(): void {
    const newValue = this.tempSelection();
    this.selectedValue.set(newValue);
    this.selectionChange.emit(newValue);
  }

  isSelected(value: T | null): boolean {
    if (this.multiple()) {
      const currentSelection = this.tempSelection() as T[] || [];
      if (value === null) {
        return currentSelection.length === 0;
      }
      return currentSelection.some(item => this.compareValues(item, value));
    } else {
      return this.compareValues(this.tempSelection(), value);
    }
  }

  getDisplayValue(): string {
    const value = this.selectedValue();

    if (value === null) {
      return this.nullOptionLabel();
    }

    if (this.multiple() && Array.isArray(value)) {
      if (value.length === 0) {
        return this.nullOptionLabel();
      }

      if (value.length === 1) {
        const selectedOption = this.findOptionByValue(value[0]);
        return selectedOption ? selectedOption.label : '';
      }

      return `${value.length} items selected`;
    }

    const selectedOption = this.findOptionByValue(value as T);
    return selectedOption ? selectedOption.label : '';
  }

  private findOptionByValue(value: T): DropdownOption<T> | undefined {
    return this.options().find(option => this.compareValues(option.value, value));
  }

  private compareValues(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (typeof o1 === 'object' && typeof o2 === 'object') {
      if ('id' in o1 && 'id' in o2) {
        return o1.id === o2.id;
      }

      return JSON.stringify(o1) === JSON.stringify(o2);
    }

    return o1 === o2;
  }
}
