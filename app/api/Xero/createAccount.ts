"use server";

import { getAuth } from "@/auth/cookie";
import { XeroToken } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import xeroClient from "@/lib/xero/xeroClient";
import {
  Account,
  AccountType,
  CurrencyCode,
  TokenSetParameters,
} from "xero-node";

function mapToken(token: XeroToken): TokenSetParameters {
  return {
    access_token: token.accessToken,
    id_token: token.tokenId as string,
    refresh_token: token.refreshToken,
  };
}
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
      code: bankAccount.cashAccountType || "Appolica",
      name: bankAccount.name || "Unknown Account",
      type: AccountType.BANK,
      bankAccountNumber: bankAccount.iban || bankAccount.accountId,
      currencyCode: (bankAccount.currency || "BGN") as unknown as CurrencyCode,
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
