import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown, remove } from 'ionicons/icons';
import { LedgerEntryWithQuantity, TotalsCalculatorService } from '../../services/totals-calculator.service';

@Component({
  selector: 'app-container-totals-summary',
  templateUrl: './container-totals-summary.component.html',
  styleUrls: ['./container-totals-summary.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonIcon
  ]
})
export class ContainerTotalsSummaryComponent {
  private readonly totalsCalculatorService = inject(TotalsCalculatorService);

  readonly entries = input<LedgerEntryWithQuantity[]>([]);
  readonly mbnName = input<string>('mike and brian\'s nursery');
  readonly title = input<string>('Total Quantity');

  readonly totals = computed(() => this.totalsCalculatorService.calculateTotals(this.entries()));

  constructor() {
    addIcons({ arrowUp, arrowDown, remove });
  }
}
