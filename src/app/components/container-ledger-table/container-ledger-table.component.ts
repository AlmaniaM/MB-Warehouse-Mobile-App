import { Component, computed, effect, input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { ContainerLedgerEntry } from '../../services/container-tracking/container-tracking.service';
import { ContainerType } from '../../services/inventory-tracking/container-type.service';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown } from 'ionicons/icons';

@Component({
  selector: 'app-container-ledger-table',
  templateUrl: './container-ledger-table.component.html',
  styleUrls: ['./container-ledger-table.component.scss'], standalone: true, imports: [
    CommonModule,
    DatePipe,
    IonItem,
    IonList,
    IonSpinner,
    IonText,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
  ]
})
export class ContainerLedgerTableComponent {
  // Input signals
  readonly containerTypes = input<ContainerType[]>([]);
  readonly ledgerEntries = input<ContainerLedgerEntry[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly disableSummary = input<boolean>(false);

  // Component state
  readonly displayedEntries = signal<ContainerLedgerEntry[]>([]);
  readonly pageSize = signal<number>(15);
  readonly currentPage = signal<number>(0);

  // Quantity totals computed property
  quantityTotals = computed(() => {
    const entries = this.filteredEntries();
    let total = 0;
    let received = 0;
    let shipped = 0;

    entries.forEach(entry => {
      if (entry.quantity) {
        total += entry.quantity;
        if (entry.quantity > 0) {
          received += entry.quantity;
        } else if (entry.quantity < 0) {
          shipped += Math.abs(entry.quantity);
        }
      }
    });

    return { total, received, shipped };
  });

  filteredEntries = computed(() => {
    const entries = this.ledgerEntries();
    const types = this.containerTypes();

    let filtered: ContainerLedgerEntry[] = [];

    if (types?.length > 0) {
      // Create a set of container type IDs for faster lookups
      const typeIds = new Set(types.map(type => type.id));
      // Filter entries by container type IDs
      filtered = entries.filter(entry => entry.containerTypeId !== null && typeIds.has(entry.containerTypeId));
    } else {
      filtered = [...entries];
    }

    filtered.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return filtered;
  });

  hasMoreEntries = computed(() => {
    const hasMore = this.filteredEntries().length > this.displayedEntries().length;
    return hasMore;
  });

  isEmpty = computed(() => {
    return !this.isLoading() && this.filteredEntries().length === 0;
  });

  hasEntries = computed(() => {
    return !this.isLoading() && this.filteredEntries().length > 0;
  });

  constructor() {
    // Register icons
    addIcons({
      'arrow-up': arrowUp,
      'arrow-down': arrowDown
    });

    effect(() => {
      const entries = this.ledgerEntries();
      const types = this.containerTypes();
      const isLoading = this.isLoading();

      if (entries.length > 0 && !isLoading) {
        this.currentPage.set(0);
        this.displayedEntries.set([]);

        // Important: only access filteredEntries() after we've already set displayedEntries to empty
        // This breaks the potential circular dependency
        const filtered = this.filteredEntries();
        if (filtered.length > 0) {
          const startIndex = 0;
          const endIndex = this.pageSize();
          const newItems = filtered.slice(startIndex, endIndex);
          this.displayedEntries.set(newItems);
          this.currentPage.set(1);
        }
      }
    });
  }

  loadInitialData(): void {
    this.currentPage.set(0);
    this.displayedEntries.set([]);
    this.loadMoreData();
  }

  loadMoreData(event?: any): void {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    const filtered = this.filteredEntries();

    if (startIndex < filtered.length) {
      const newItems = filtered.slice(startIndex, endIndex);

      if (this.currentPage() === 0) {
        this.displayedEntries.set(newItems);
      } else {
        this.displayedEntries.set([...this.displayedEntries(), ...newItems]);
      }

      this.currentPage.set(this.currentPage() + 1);
    }

    if (event) {
      event.target.complete();

      if (endIndex >= filtered.length) {
        event.target.disabled = true;
      }
    }
  }

  getQuantityColor(quantity: number | null): string {
    if (quantity === null || quantity === undefined || quantity === 0) return 'medium';
    return quantity > 0 ? 'success' : 'danger';
  }

  formatQuantity(quantity: number | null): string {
    if (quantity === null || quantity === undefined || quantity === 0) return '0';
    return quantity > 0 ? `+${quantity}` : `${quantity}`;
  }

  getQuantityArrow(quantity: number | null): string {
    if (quantity === null || quantity === undefined || quantity === 0) return '';
    return quantity > 0 ? 'arrow-up' : 'arrow-down';
  }

  resetInfiniteScroll(event: CustomEvent): void {
    const infiniteScroll = event.target as HTMLIonInfiniteScrollElement;
    infiniteScroll.disabled = false;

    // Reset pagination
    this.currentPage.set(0);
    this.displayedEntries.set([]);
    this.loadMoreData();
  }
}
