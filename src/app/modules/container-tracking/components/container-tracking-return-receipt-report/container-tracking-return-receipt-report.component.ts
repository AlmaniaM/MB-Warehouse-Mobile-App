import { 
  Component, 
  computed,
  effect, 
  inject,
  input, 
  InputSignal, 
  Signal, 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

import { IonProgressBar } from '@ionic/angular/standalone';

import { SelectedContainerReturnReceiptService } from '../../services/selected-container-return-receipt.service';
import { ContainerTrackingReturnReceiptReportServiceService } from '../../services/container-tracking-return-receipt-report-service.service';
import { ContainerReturnReceipt } from '../../services/container-return-receipt.service';

@Component({
  selector: 'app-container-tracking-return-receipt-report',
  templateUrl: './container-tracking-return-receipt-report.component.html',
  styleUrls: ['./container-tracking-return-receipt-report.component.scss'],
  imports: [
    CommonModule,
    IonProgressBar,
],
})
export class ContainerTrackingReturnReceiptReportComponent {

  domSanitizer: DomSanitizer = inject(DomSanitizer);
  containerTrackingReturnReceiptReportService: ContainerTrackingReturnReceiptReportServiceService = inject(ContainerTrackingReturnReceiptReportServiceService);
  containerTrackingReturnReceiptReportServiceStatus: Signal<'fetching' | 'error' | 'stable'> = toSignal(this.containerTrackingReturnReceiptReportService.statusSubject, { requireSync: true });
  selectedContainerReturnReceiptService: SelectedContainerReturnReceiptService = inject(SelectedContainerReturnReceiptService);
  
  isFetching: Signal<boolean> = computed(() => this.containerTrackingReturnReceiptReportServiceStatus() === 'fetching'); 
  selectedReceipt: Signal<ContainerReturnReceipt | null> = toSignal(this.selectedContainerReturnReceiptService.selectedContainerReturnReceipt, { initialValue: null });
  reportType: InputSignal<'html' | 'pdf'> = input<'html' | 'pdf'>('html');

  receiptReportRawHtml: Signal<string> = toSignal(this.containerTrackingReturnReceiptReportService.containerReturnReceiptReportHtml, { initialValue: '' });
  receiptReportHtml: Signal<SafeHtml | null> = computed(() => {
    if (this.receiptReportRawHtml() === '') { return null }
    
    return this.domSanitizer.bypassSecurityTrustHtml(this.receiptReportRawHtml());
  });

  receiptReportPdfRawUrl: Signal<string | null> = toSignal(this.containerTrackingReturnReceiptReportService.containerReturnReceiptReportPdfUrl, { initialValue: '' });
  receiptReportPdfUrl: Signal<SafeResourceUrl | null> = computed(() => {
    if (!this.receiptReportPdfRawUrl()) { return null }
    if (this.receiptReportPdfRawUrl() === '') { return null }

    const sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.receiptReportPdfRawUrl()!);
    return sanitizedUrl;
  });
  
  receiptReportEffect = effect(() => {
    if (!this.selectedReceipt()) { return; }
    if (this.reportType() === 'html') {
      this.containerTrackingReturnReceiptReportService.getContainerReturnReceiptReportHtml(this.selectedReceipt()!.id); 
    } else {
      this.containerTrackingReturnReceiptReportService.getContainerReturnReceiptReportPdf(this.selectedReceipt()!.id, 'preview');
    }
  });
}
