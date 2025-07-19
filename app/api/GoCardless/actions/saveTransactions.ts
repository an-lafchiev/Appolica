"use server";

import { getAuth } from "@/auth/cookie";
import { Prisma } from "@/lib/generated/prisma";
import { getAccountTransactions } from "@/lib/goCardlessClient";
import { prisma } from "@/lib/prisma";

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

    await prisma.accountTransaction.upsert({
      where: { accountId: account.accountId },
      create: {
        accountId: account.accountId,
        booked: {
          createMany: {
            data: (transactions.booked ?? []).map((tx) => ({
              transactionId: account.accountId + tx.internalTransactionId, // sandbox id limitation
              entryReference: tx.entryReference,
              creditorName: tx.creditorName,
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
  } catch (error) {
    console.error(error);
  }
}
