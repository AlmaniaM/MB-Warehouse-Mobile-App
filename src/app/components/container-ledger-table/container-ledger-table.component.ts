import { Component, computed, effect, input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonItem,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonText,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { ContainerLedgerEntry } from '../../services/container-tracking/container-tracking.service';
import { ContainerType } from '../../services/inventory-tracking/container-type.service';

@Component({
  selector: 'app-container-ledger-table',
  templateUrl: './container-ledger-table.component.html',
  styleUrls: ['./container-ledger-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonItem,
    IonList,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSpinner,
    IonText,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent]
})
export class ContainerLedgerTableComponent {  // Input signals
  readonly containerTypes = input<ContainerType[]>([]);
  readonly ledgerEntries = input<ContainerLedgerEntry[]>([]);
  readonly isLoading = input<boolean>(false);

  // Component state
  readonly displayedEntries = signal<ContainerLedgerEntry[]>([]);
  readonly pageSize = signal<number>(15);
  readonly currentPage = signal<number>(0);

  private readonly dataReloadNeeded = signal<boolean>(true);
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

    console.log('After filtering and sorting, total records:', filtered.length);
    return filtered;
  });

  hasMoreEntries = computed(() => {
    const hasMore = this.filteredEntries().length > this.displayedEntries().length;
    console.log('hasMoreEntries:', hasMore,
      'filtered:', this.filteredEntries().length,
      'displayed:', this.displayedEntries().length);
    return hasMore;
  });

  isEmpty = computed(() => {
    return !this.isLoading() && this.filteredEntries().length === 0;
  });

  hasEntries = computed(() => {
    return !this.isLoading() && this.filteredEntries().length > 0;
  });

  constructor() {
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

    console.log('Pagination info:', {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      startIndex,
      endIndex,
      filteredLength: filtered.length
    });

    if (startIndex < filtered.length) {
      const newItems = filtered.slice(startIndex, endIndex);
      console.log('Loading more items:', newItems.length);

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
        console.log('Disabling infinite scroll');
        event.target.disabled = true;
      }
    }
  }

  getQuantityColor(quantity: number | null): string {
    if (quantity === null || quantity === undefined) return 'medium';
    return quantity > 0 ? 'success' : 'danger';
  }
  formatQuantity(quantity: number | null): string {
    if (quantity === null || quantity === undefined) return '0';
    return quantity > 0 ? `+${quantity}` : `${quantity}`;
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
