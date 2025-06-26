import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
  IonRouterOutlet
} from '@ionic/angular/standalone';

import { PageTopbarComponent } from '../../components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { addIcons } from 'ionicons';
import { gridSharp, peopleOutline, peopleSharp, bookOutline, bookSharp, gridOutline } from 'ionicons/icons';

@Component({
  selector: 'app-container-tracking',
  templateUrl: './container-tracking.page.html',
  styleUrls: ['./container-tracking.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonTabs,
    IonTabBar,
    IonRouterOutlet,
    IonIcon,
    IonLabel,
    IonTabButton,
    PageTopbarComponent,
    ContentTopbarComponent,
  ]
})
export class ContainerTrackingPage {
  constructor() {
    addIcons({
      'grid-outline': gridOutline,
      'grid-sharp': gridSharp,
      'people-outline': peopleOutline,
      'people-sharp': peopleSharp,
      'book-outline': bookOutline,
      'book-sharp': bookSharp
    });
  }
}
