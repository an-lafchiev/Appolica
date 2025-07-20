"use server";

import { getAuth } from "@/auth/cookie";
import { mapToken } from "@/helpers/mapXeroToken";
import { prisma } from "@/lib/prisma";
import xeroClient from "@/lib/xero/xeroClient";
import { Account, AccountType, CurrencyCode } from "xero-node";

export default async function createAccount(accountId: string) {
  const { user } = await getAuth();

  if (!user) return;

  const tokenSetParameters = mapToken(user.xeroTokens[0]);

  await xeroClient.setTokenSet(tokenSetParameters);

  const bankAccount = await prisma.bankAccount.findUnique({
    where: { accountId },
  });
  if (!bankAccount) return;

  const tenantId = user.xeroTokens[0].tenantId;
  if (!tenantId) return;
  try {
    const formattedAccount: Account = {
      code: `GC-${bankAccount.accountId.slice(0, 6).toUpperCase()}`,
      name:
        `${bankAccount.name} - ${bankAccount.institutionId} - ${(
          bankAccount.iban as string
        ).slice(-4)}` || "Unknown Account",
      type: AccountType.BANK,
      bankAccountNumber: bankAccount.iban || bankAccount.accountId,
      currencyCode: "BGN" as unknown as CurrencyCode,
      /*  [{"Message":"The current organisation is not subscribed to currency 'EUR'."} 
      Needs multi-tenant, which is premium plan supported
      */
      description: "Appolica GoCardless bank account",
    };

    const response = await xeroClient.accountingApi.createAccount(
      tenantId,
      formattedAccount
    );

    return response;
  } catch (err) {
    console.error(err);
  }
}
