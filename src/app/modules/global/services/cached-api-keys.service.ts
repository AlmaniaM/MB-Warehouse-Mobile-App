import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CachedApiKeysService {

  private mbnReportServiceApiKeySubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public readonly mbnReportServiceApiKey: Observable<string | null> = this.mbnReportServiceApiKeySubject.asObservable();

  constructor() {
    this.getMbnReportServiceApiKey();
  }

  getMbnReportServiceApiKey() {
    const reportServiceApiKey = localStorage.getItem(environment.appName + 'ReportServiceApiKey');
    if (reportServiceApiKey === null) {
      this.setMbnReportServiceApiKey(null);
      return;
    }
    this.mbnReportServiceApiKeySubject.next(JSON.parse(reportServiceApiKey));
  }

  setMbnReportServiceApiKey(reportServiceApiKey: string | null) {
    localStorage.setItem(environment.appName + 'ReportServiceApiKey', JSON.stringify(reportServiceApiKey));
    this.mbnReportServiceApiKeySubject.next(reportServiceApiKey);
  }
}
