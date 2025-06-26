import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonDatetime,
  IonModal,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  chevronDownOutline,
  closeCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonDatetime,
    IonModal,
    IonLabel,
  ]
})
export class DateFilterComponent {
  readonly dateRange = model<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null
  });
  readonly isStartDateOpen = model<boolean>(false);
  readonly isEndDateOpen = model<boolean>(false);

  readonly dateRangeChange = output<{ startDate: string | null; endDate: string | null }>();

  constructor() {
    addIcons({
      'calendar-outline': calendarOutline,
      'chevron-down-outline': chevronDownOutline,
      'close-circle-outline': closeCircleOutline,
    });
  }

  onStartDateChange(event: any): void {
    const date = event.detail.value;
    const newDateRange = {
      ...this.dateRange(),
      startDate: date
    };

    this.dateRange.set(newDateRange);
    this.dateRangeChange.emit(newDateRange);
    this.isStartDateOpen.set(false);
  }

  onEndDateChange(event: any): void {
    const date = event.detail.value;
    const newDateRange = {
      ...this.dateRange(),
      endDate: date
    };

    this.dateRange.set(newDateRange);
    this.dateRangeChange.emit(newDateRange);
    this.isEndDateOpen.set(false);
  }

  resetDateRange(): void {
    const newDateRange = {
      startDate: null,
      endDate: null
    };

    this.dateRange.set(newDateRange);
    this.dateRangeChange.emit(newDateRange);
  }
}
