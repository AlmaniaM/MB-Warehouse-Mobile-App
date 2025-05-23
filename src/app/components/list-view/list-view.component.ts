import { Component, computed, contentChild, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  standalone: true, imports: [
    CommonModule,
    IonItem,
    IonList,
    IonSpinner,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonAccordionGroup,
    IonAccordion,
    IonLabel,
    IonIcon
  ]
})
export class ListViewComponent<T> {
  readonly items = input<T[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly title = input<string>('List View');
  readonly emptyStateMessage = input<string>('No items found');
  readonly disableSummary = input<boolean>(false);
  readonly pageSize = input<number>(15);
  readonly trackByFn = input<(index: number, item: T) => any>((_, item: any) => item?.id || Math.random());
  readonly totals = input<number>(0);

  readonly loadMore = output<any>();

  readonly itemTemplateRef = contentChild.required<any>('itemTemplate');
  readonly filterTemplateRef = contentChild<any>('filterTemplate');
  readonly summaryTemplateRef = contentChild<any>('summaryTemplate');

  readonly displayedItems = signal<T[]>([]);
  readonly currentPage = signal<number>(0);
  readonly hasMoreItems = computed(() => this.items().length > this.displayedItems().length);
  readonly isEmpty = computed(() => !this.isLoading() && this.items().length === 0);
  readonly hasItems = computed(() => !this.isLoading() && this.items().length > 0);
  readonly defaultExpandedAccordions = new Set(['filters', 'summary']);

  constructor() {
    effect(() => {
      const items = this.getNextDisplayedItems();

      if (items.length === 0) {
        return;
      }

      this.displayedItems.set(items);
    });
  }

  get totalsClass(): string {
    if (this.totals() === null || this.totals() === undefined) return 'neutral';
    if (this.totals() > 0) return 'positive';
    if (this.totals() < 0) return 'negative';
    return 'neutral';
  }

  refreshItems(): void {
    this.currentPage.set(0);
    this.loadMoreItems();
  }

  loadMoreItems(event?: any): void {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    if (this.items().length === 0) {
      this.loadMore.emit(event);
      return;
    }

    const filtered = this.items();
    if (startIndex < filtered.length || filtered.length === 0) {
      const newItems = filtered.slice(startIndex, endIndex);
      this.displayedItems.set(this.currentPage() === 0 ? newItems : [...this.displayedItems(), ...newItems]);
      this.currentPage.set(this.currentPage() + 1);
    }

    if (event) {
      event.target.complete();
      if (endIndex >= filtered.length) {
        event.target.disabled = true;
      }
    }

    this.loadMore.emit(event);
  }

  forceRefresh(): void {
    this.refreshItems();
  }

  private getNextDisplayedItems(): T[] {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.items().slice(startIndex, endIndex);
  }
}
