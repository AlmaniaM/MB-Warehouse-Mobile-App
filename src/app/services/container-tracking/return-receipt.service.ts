import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContainerReturnReceiptEntry } from './container-tracking.service';

@Injectable({
  providedIn: 'root',
})
export class ReturnReceiptService {
  public readonly returnReceipts = signal<ContainerReturnReceiptEntry[]>([]);
  public readonly isFetchingReturnReceipts = signal<boolean>(false);

  private readonly baseUrl: string = `${environment.azureInventoryTrackingApiBaseUrl}mbn/containertracking/returnreceipt`;

  private readonly http = inject(HttpClient);

  public getAllReturnReceipts(): void {
    this.isFetchingReturnReceipts.set(true);
    this.http.get<ContainerReturnReceiptEntry[]>(this.baseUrl)
      .subscribe((entries: ContainerReturnReceiptEntry[]) => {
        this.returnReceipts.set(entries);
        this.isFetchingReturnReceipts.set(false);
      });
  }

  public createReturnReceipt(returnReceipt: ContainerReturnReceiptEntry): Observable<ContainerReturnReceiptEntry> {
    return this.http.post<ContainerReturnReceiptEntry>(this.baseUrl, returnReceipt);
  }

  public updateReturnReceipt(returnReceipt: ContainerReturnReceiptEntry): Observable<ContainerReturnReceiptEntry> {
    return this.http.put<ContainerReturnReceiptEntry>(this.baseUrl, returnReceipt);
  }

  public deleteReturnReceipt(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
