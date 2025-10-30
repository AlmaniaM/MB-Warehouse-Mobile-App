import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonList, IonNote, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-shipping-sheet-photo',
  templateUrl: './shipping-sheet-photo.component.html',
  styleUrls: ['./shipping-sheet-photo.component.scss'],
  imports: [CommonModule, IonList, IonItem, IonLabel, IonText, IonNote],
})
export class ShippingSheetPhotoComponent {}
