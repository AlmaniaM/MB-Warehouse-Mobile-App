import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { 
  IonContent, 
  IonCard, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardHeader, 
  IonCardContent, 
  IonButton 
} from '@ionic/angular/standalone';

import { PageTopbarComponent } from '../../components/page-topbar/page-topbar.component';
import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { AppPage } from 'src/app/modules/global/types/app-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    IonContent,
    IonButton, 
    IonCardContent, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle, 
    IonCard, 
    PageTopbarComponent,
    ContentTopbarComponent
  ]
})
export class HomePage { 
  appPages: AppPage[] = [
    { title: 'Budding', tabLabel: 'Budding', url: '/app/budding', fragment: '', icon: 'cube', isExternal: false, showInMenu: true },
    { title: 'Containers', tabLabel: 'Containers', url: '/app/container-tracking', fragment: '', icon: 'leaf', isExternal: false, showInMenu: true },
  ];
}
