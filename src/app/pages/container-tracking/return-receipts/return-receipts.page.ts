import { Component } from '@angular/core';

import { 
  IonContent 
} from "@ionic/angular/standalone";

import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';

@Component({
  selector: 'app-return-receipts',
  templateUrl: './return-receipts.page.html',
  styleUrls: ['./return-receipts.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent
  ]
})
export class ReturnReceiptsPage {

}
