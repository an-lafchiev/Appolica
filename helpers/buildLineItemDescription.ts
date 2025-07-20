import { BookedTransaction } from "@/lib/generated/prisma";
import { formatDate } from "./formatDate";

export function buildLineItemDescription(trx: BookedTransaction): string {
  return `TrxCode: ${trx.transactionCode} Payee: ${trx.creditorName} | Ref: ${
    trx.entryReference
  } | Date: ${formatDate(trx.valueDate)}`;
}
