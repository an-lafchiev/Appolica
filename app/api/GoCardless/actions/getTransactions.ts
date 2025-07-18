"use server";

import { prisma } from "@/lib/prisma";

export default async function getTransactions(accountTransactionId: string) {
  const data = await prisma.bookedTransaction.findMany({
    where: { accountTransactionId },
  });

  if (data) {
    return data;
  }

  return [];
}
