import { Component } from '@angular/core';

import { 
  IonContent 
} from "@ionic/angular/standalone";

import { ContentTopbarComponent } from 'src/app/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/components/page-topbar/page-topbar.component';

@Component({
  selector: 'app-container-return-receipts',
  templateUrl: './container-return-receipts.page.html',
  styleUrls: ['./container-return-receipts.page.scss'],
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent
  ]
})
export class ContainerReturnReceiptsPage {

}
