import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { IonRouterOutlet, IonApp } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeSharp,
  homeOutline,
  cubeSharp,
  cubeOutline,
  arrowUpSharp,
  arrowUpOutline,
  arrowDownSharp,
  arrowDownOutline,
  arrowUndoSharp,
  arrowUndoOutline,
  menuSharp,
  menuOutline,
  bookSharp,
  bookOutline,
  gridSharp,
  gridOutline,
  peopleSharp,
  peopleOutline,
  receiptSharp,
  receiptOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    IonRouterOutlet,
    IonApp
  ],
})
export class AppComponent {

  isIframe = window !== window.parent && !window.opener;
    constructor() {
    addIcons({
      homeSharp,
      homeOutline,
      cubeSharp,
      cubeOutline,
      arrowUpSharp,
      arrowUpOutline,
      arrowDownSharp,
      arrowDownOutline,
      arrowUndoSharp,
      arrowUndoOutline,
      menuSharp,
      menuOutline,
      bookSharp,
      bookOutline,
      gridSharp,
      gridOutline,
      peopleSharp,
      peopleOutline,
      receiptSharp,
      receiptOutline,
    });
  }
}
