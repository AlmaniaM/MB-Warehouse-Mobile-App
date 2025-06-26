import { Component, computed, input, output, signal, viewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonItem,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { ContainerLedgerEntry } from '../../../../services/container-tracking/container-tracking.service';
import { ContainerType, ContainerTypeService } from '../../../../services/inventory-tracking/container-type.service';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown, filter as filterIcon, remove } from 'ionicons/icons';
import { DropdownOption, DropdownSelectComponent } from '../../../../components/dropdown-select/dropdown-select.component';
import { ListViewComponent } from '../../../../components/list-view/list-view.component';

@Component({
  selector: 'app-container-ledger-table',
  templateUrl: './container-ledger-table.component.html',
  styleUrls: ['./container-ledger-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonItem,
    IonIcon,
    IonCardContent,
    DropdownSelectComponent,
    ListViewComponent,
    IonCard
  ]
})
export class ContainerLedgerTableComponent {
  private readonly containerTypeService = inject(ContainerTypeService);

  // 2. inputs
  readonly ledgerEntries = input<ContainerLedgerEntry[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly disableSummary = input<boolean>(false);
  readonly disableFilters = input<boolean>(false);

  readonly containerTypeChange = output<ContainerType[]>();

  readonly listView = viewChild<ListViewComponent<ContainerLedgerEntry>>(ListViewComponent);

  readonly selectedContainerTypes = signal<ContainerType[]>([]);
  readonly containerTypeOptions = computed<DropdownOption<ContainerType>[]>(() => {
    const types = this.containerTypeService.containerTypes() || [];
    return types.map(type => ({
      label: type.name,
      value: type
    }));
  });
  readonly containerTypeTotals = computed(() => {
    const entries = this.filteredEntries();
    if (!entries || entries.length === 0) return 0;

    return entries.reduce((total, entry) => {
      return total + (entry.quantity || 0);
    }, 0);
  });
  readonly filteredEntries = computed(() => {
    const entries = this.ledgerEntries();
    const types = this.selectedContainerTypes();

    let filtered: ContainerLedgerEntry[] = [];

    if (types?.length > 0) {
      const typeIds = new Set(types.map(type => type.id));
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

  constructor() {
    addIcons({ arrowUp, arrowDown, filterIcon, remove });
  }

  loadContainerTypes(force: boolean = false): void {
    this.containerTypeService.getContainerTypes(force);
  }

  onContainerTypeChange(containerTypes: ContainerType | ContainerType[] | null): void {
    const containerTypesArray = (Array.isArray(containerTypes) ? containerTypes : [containerTypes])
      .filter(type => type !== null);

    this.selectedContainerTypes.set(containerTypesArray);
    this.containerTypeChange.emit(containerTypesArray);

    if (this.listView()) {
      this.listView()!.refreshItems();
    }
  }

  trackByEntryId(index: number, entry: ContainerLedgerEntry): number {
    return entry.id;
  }

  getQuantityClass(quantity: number | null): string {
    if (!quantity) return '';
    return quantity > 0 ? 'positive' : 'negative';
  }

  formatQuantity(quantity: number | null): string {
    if (quantity === null || quantity === undefined) return '0';
    return quantity > 0 ? `+${quantity}` : `${quantity}`;
  }
}
