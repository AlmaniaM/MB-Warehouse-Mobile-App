import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

@Component({
  selector: 'app-container-tracking',
  templateUrl: './container-tracking.page.html',
  styleUrls: ['./container-tracking.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
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



}
