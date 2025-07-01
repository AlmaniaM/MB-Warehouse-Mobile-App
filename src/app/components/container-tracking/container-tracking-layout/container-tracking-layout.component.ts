import { Component } from '@angular/core';

import { 
  IonTabButton, 
  IonIcon, 
  IonTabBar, 
  IonTabs 
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-container-tracking-layout',
  templateUrl: './container-tracking-layout.component.html',
  styleUrls: ['./container-tracking-layout.component.scss'],
  imports: [
    IonTabButton,
    IonTabBar, 
    IonTabs, 
    IonIcon
  ],
})
export class ContainerTrackingLayoutComponent {

}
