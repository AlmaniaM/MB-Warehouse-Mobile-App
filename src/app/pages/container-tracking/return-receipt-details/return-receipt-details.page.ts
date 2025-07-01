import { Component } from '@angular/core';

import { 
  IonContent 
} from "@ionic/angular/standalone";

import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';

@Component({
  selector: 'app-return-receipt-details',
  templateUrl: './return-receipt-details.page.html',
  styleUrls: ['./return-receipt-details.page.scss'],
  imports: [ 
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent
  ]
})
export class ReturnReceiptDetailsPage {

}
