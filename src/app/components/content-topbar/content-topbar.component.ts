import { Component, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonRefresher, 
  IonRefresherContent 
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-content-topbar',
  templateUrl: './content-topbar.component.html',
  styleUrls: ['./content-topbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonRefresher,
    IonRefresherContent
  ]
})
export class ContentTopbarComponent {
  title: InputSignal<string> = input.required<string>();
  showRefresher: InputSignal<boolean> = input.required<boolean>();
  refreshPage(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 500);
  }
}