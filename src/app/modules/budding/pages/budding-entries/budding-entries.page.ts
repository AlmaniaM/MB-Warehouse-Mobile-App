import { Component } from '@angular/core';
import { IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';

@Component({
  selector: 'app-budding-entries',
  templateUrl: './budding-entries.page.html',
  styleUrls: ['./budding-entries.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList, 
    IonItem, 
    IonLabel, 
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class BuddingEntriesPage { }
