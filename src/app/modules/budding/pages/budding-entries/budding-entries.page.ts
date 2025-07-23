import { 
  Component, 
  computed, 
  effect, 
  inject,
  signal, 
  Signal, 
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { 
  IonContent,
  IonList,
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonHeader,
  IonFab, 
  IonFabButton, 
  IonSelect,
  IonModal, 
  IonProgressBar,
  IonSelectOption, 
  IonText, 
  IonNote,
  IonToolbar, 
  IonSearchbar, 
  IonButton, 
  IonButtons, 
  IonTitle,
  IonAccordionGroup, 
  IonAccordion,
} from "@ionic/angular/standalone";

import { PlantedRootPool } from '../../services/planted-root-pool.service';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { Rootstock } from 'src/app/modules/sourcelists/services/rootstock.service';
import { Supplier } from 'src/app/modules/sourcelists/services/supplier.service';
import { Variety } from 'src/app/modules/sourcelists/services/variety.service';

export interface PlantedRootPoolListRecord{
  plantedRootPool: PlantedRootPool;
  rootstock: Rootstock;
  supplier: Supplier;
  plantedVariety: Variety | null;
}

@Component({
  selector: 'app-budding-entries',
  templateUrl: './budding-entries.page.html',
  styleUrls: ['./budding-entries.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    DatePipe,
    IonAccordion, 
    IonAccordionGroup, 
    IonContent,
    IonButtons, 
    IonButton, 
    IonTitle, 
    IonHeader, 
    IonList,
    IonItem, 
    IonIcon, 
    IonToolbar, 
    IonSearchbar, 
    IonLabel,
    IonFab, 
    IonFabButton, 
    IonSelect,
    IonModal, 
    IonProgressBar,
    IonSelectOption, 
    IonText, 
    IonNote,  
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class BuddingEntriesPage { 

  globalSearchFilter: WritableSignal<string> = signal('');

}
