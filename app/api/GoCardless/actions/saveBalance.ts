"use server";

import { getAuth } from "@/auth/cookie";
import { Prisma } from "@/lib/generated/prisma";
import { getAccountBalance } from "@/lib/goCardlessClient";
import { prisma } from "@/lib/prisma";

type BankAccountWithRelations = Prisma.BankAccountGetPayload<{
  include: { balance: true; transactions: true };
}>;

export default async function saveBalance(account: BankAccountWithRelations) {
  const { user } = await getAuth();

  try {
    if (!user) return;
    const token = user.goCardlessTokens[0].accessToken;

    const { balances } = await getAccountBalance(account.accountId, token);

    if (!balances) {
      return;
    }
    const availableBalance = balances.find(
      (b) => b.balanceType === "interimAvailable"
    );
    const expectedBalance = balances.find((b) => b.balanceType === "expected");
    await prisma.accountBalance.upsert({
      where: { accountId: account.accountId },
      create: {
        accountId: account.accountId,
        balanceAvailable: availableBalance?.balanceAmount.amount,
        balanceExpected: expectedBalance?.balanceAmount.amount,
        updatedAt: new Date(),
      },

      update: {
        accountId: account.accountId,
        balanceAvailable: availableBalance?.balanceAmount.amount,
        balanceExpected: expectedBalance?.balanceAmount.amount,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(error);
  }
}
