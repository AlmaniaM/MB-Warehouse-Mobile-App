import { Component } from '@angular/core';

import { 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText
} from '@ionic/angular/standalone';

import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';

@Component({
  selector: 'app-pull-sheets',
  templateUrl: './pull-sheets.page.html',
  styleUrls: ['./pull-sheets.page.scss'],
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class PullSheetsPage {}
