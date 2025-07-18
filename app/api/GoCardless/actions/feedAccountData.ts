"use server";

import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

import saveTransactions from "./saveTransactions";
import saveBalance from "./saveBalance";

export type BankAccountWithRelations = Prisma.BankAccountGetPayload<{
  include: { balance: true; transactions: true };
}>;

export default async function feedAccountData(
  bankAccounts: BankAccountWithRelations[]
) {
  try {
    await Promise.all(
      bankAccounts.map((account) => {
        return saveTransactions(account);
      })
    );

    await Promise.all(
      bankAccounts.map((account) => {
        return saveBalance(account);
      })
    );
  } catch (error) {
    console.error(error);
  }
}
