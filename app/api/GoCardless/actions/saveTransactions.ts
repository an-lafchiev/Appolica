"use server";

import { getAuth } from "@/auth/cookie";
import { Prisma } from "@/lib/generated/prisma";
import { getAccountTransactions } from "@/lib/goCardlessClient";
import { prisma } from "@/lib/prisma";
import createContacts from "../../Xero/createContacts";

type BankAccountWithRelations = Prisma.BankAccountGetPayload<{
  include: { balance: true; transactions: true };
}>;

export default async function saveTransactions(
  account: BankAccountWithRelations
) {
  const { user } = await getAuth();

  try {
    if (!user) return;
    const token = user.goCardlessTokens[0].accessToken;

    const { transactions } = await getAccountTransactions(
      account.accountId,
      token
    );

    const seen = new Set();

    // sandbox id limitation
    const filteredTransactions = transactions.booked.filter((trx) => {
      if (!trx.internalTransactionId) return false;
      if (seen.has(trx.internalTransactionId)) return false;

      seen.add(trx.internalTransactionId);
      return true;
    });

    await prisma.accountTransaction.upsert({
      where: { accountId: account.accountId },
      create: {
        accountId: account.accountId,
        booked: {
          createMany: {
            data: (filteredTransactions ?? []).map((tx) => ({
              transactionId: account.accountId + tx.internalTransactionId, // sandbox id limitation
              entryReference: tx.entryReference,
              creditorName: tx.creditorName,
              debtorName: tx.debtorName,
              type: tx.proprietaryBankTransactionCode,
              amount: tx.transactionAmount.amount,
              valueDate: new Date(tx.valueDate || Date.now()),
              transactionCode: tx.bankTransactionCode,
            })),
          },
        },
        pending: {
          createMany: {
            data: (transactions.pending ?? []).map((tx) => ({
              transactionId: account.accountId + tx.transactionId,
              entryReference: tx.entryReference,
              creditorName: tx.creditorName,
              debtorName: tx.debtorName,
              type: tx.proprietaryBankTransactionCode,
              amount: tx.transactionAmount.amount,
              valueDate: new Date(tx.valueDate || Date.now()),
              transactionCode: tx.bankTransactionCode,
            })),
          },
        },
      },
      update: {},
    });

    const contactList = Object.values(
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

    await createContacts(contactList);
  } catch (error) {
    console.error(error);
  }
}
