import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { ContentTopbarComponent } from 'src/app/modules/global/components/content-topbar/content-topbar.component';
import { PageTopbarComponent } from 'src/app/modules/global/components/page-topbar/page-topbar.component';

@Component({
  selector: 'app-budding-entry-details',
  templateUrl: './budding-entry-details.page.html',
  styleUrls: ['./budding-entry-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    ContentTopbarComponent,
    PageTopbarComponent
  ]
})
export class BuddingEntryDetailsPage {
  
}
