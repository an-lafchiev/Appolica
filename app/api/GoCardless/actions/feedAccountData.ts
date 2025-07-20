"use server";

import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

import saveTransactions from "./saveTransactions";
import saveBalance from "./saveBalance";
import createXeroBankTransactions from "../../Xero/creatXeroBankTransactions";

export type BankAccountWithRelations = Prisma.BankAccountGetPayload<{
  include: { balance: true; transactions: true };
}>;

export default async function feedAccountData(
  bankAccounts: BankAccountWithRelations[]
) {
  try {
    await Promise.allSettled(
      bankAccounts.map((account) => {
        return saveTransactions(account);
      })
    );

    await Promise.allSettled(
      bankAccounts.map((account) => {
        return saveBalance(account);
      })
    );

    await createXeroBankTransactions();
  } catch (error) {
    console.error(error);
  } finally {
    revalidatePath("/dashboard");
  }
}
