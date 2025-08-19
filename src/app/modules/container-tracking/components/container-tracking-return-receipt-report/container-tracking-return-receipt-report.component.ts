import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';
import { ContainerTrackingReturnReceiptReportServiceService } from '../../services/container-tracking-return-receipt-report-service.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { IonProgressBar } from '@ionic/angular/standalone';
import { SelectedContainerReturnReceiptService } from '../../services/selected-container-return-receipt.service';

@Component({
  selector: 'app-container-tracking-return-receipt-report',
  templateUrl: './container-tracking-return-receipt-report.component.html',
  styleUrls: ['./container-tracking-return-receipt-report.component.scss'],
  imports: [
    IonProgressBar,
],
})
export class ContainerTrackingReturnReceiptReportComponent {

  containerTrackingReturnReceiptReportService: ContainerTrackingReturnReceiptReportServiceService = inject(ContainerTrackingReturnReceiptReportServiceService);
  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  
  selectedReceipt = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt);

  containerTrackingReturnReceiptReportServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.containerTrackingReturnReceiptReportService.statusSubject, {requireSync: true});
  isFetching: Signal<boolean> = computed(() => this.containerTrackingReturnReceiptReportServiceStatus() === 'fetching'); 

  domSanitizer: DomSanitizer = inject(DomSanitizer);
  receiptReportRawHtml: Signal<string> = toSignal(this.containerTrackingReturnReceiptReportService.containerReturnReceiptReportHtml, { initialValue: '' });
  receiptReportHtml: Signal<SafeHtml | null> = computed(() => {
    if (this.receiptReportRawHtml() === '') { return null }
    return this.domSanitizer.bypassSecurityTrustHtml(this.receiptReportRawHtml());
  });

  receiptReportEffect = effect(() => {
    if (!this.selectedReceipt()) { return; }
    this.containerTrackingReturnReceiptReportService.getContainerReturnReceiptReportHtml(this.selectedReceipt()!.id);

  })


}
