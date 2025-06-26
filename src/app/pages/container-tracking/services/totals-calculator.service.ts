import { Injectable } from '@angular/core';
import { MBN_NAME } from 'src/app/services/source-lists/customer.service';

export interface LedgerEntryWithQuantity {
  quantity: number | null;
  customerName?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TotalsCalculatorService {
  calculateTotals(ledgerEntries: LedgerEntryWithQuantity[]) {
    if (!ledgerEntries || ledgerEntries.length === 0) return 0;

    return ledgerEntries.reduce((total, entry) => {
      const quantity = entry.quantity || 0;
      if (quantity === 0) return total;

      const customerName = entry.customerName?.toLowerCase() || '';
      const isMbnTransaction = customerName === MBN_NAME || customerName === '';

      // Direction-aware calculation:
      // Positive when: (quantity > 0 AND sent from customer to MBN) OR (quantity < 0 AND sent from MBN to customer)
      // This means:
      // - If quantity > 0 and customer is NOT MBN (customer to MBN transaction) → count as positive
      // - If quantity < 0 and customer IS MBN (MBN to customer transaction) → count as positive
      // - If quantity > 0 and customer IS MBN (MBN to customer transaction) → count as negative
      // - If quantity < 0 and customer is NOT MBN (customer to MBN transaction) → count as negative

      if (quantity > 0) {
        // Positive quantity
        if (isMbnTransaction) {
          // MBN to customer transaction - count as negative
          return total - quantity;
        } else {
          // Customer to MBN transaction - count as positive
          return total + quantity;
        }
      } else {
        // Negative quantity
        if (isMbnTransaction) {
          // MBN to customer transaction - count as positive (negating the negative)
          return total - quantity; // subtracting negative = adding positive
        } else {
          // Customer to MBN transaction - count as negative
          return total + quantity; // adding negative
        }
      }
    }, 0);
  }
}
