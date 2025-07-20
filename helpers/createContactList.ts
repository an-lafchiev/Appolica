import { components } from "@/app/api/GoCardless/types";

export const createContactList = (transactions: {
  booked: components["schemas"]["TransactionSchema"][];
  pending?: components["schemas"]["TransactionSchema"][];
}) =>
  Object.values(
    transactions.booked.reduce((acc, trx) => {
      const cleanName = (trx.creditorName || trx.debtorName || "Unknown")
        .trim()
        .toLowerCase();
      if (!acc[cleanName]) {
        acc[cleanName] = {
          name: trx.creditorName || trx.debtorName || "Unknown",
          emailAddress: `${cleanName.replace(/\s+/g, "")}@appolica.com`,
        };
      }
      return acc;
    }, {} as Record<string, { name: string; emailAddress: string }>)
  );
