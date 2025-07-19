"use server";
import { getAuth } from "@/auth/cookie";
import xeroClient from "@/lib/xero/xeroClient";
import { getValidXeroToken, getXeroTokenInfo } from "./setupXeroAuth";
import { mapToken } from "@/helpers/mapXeroToken";

export default async function getXeroBankAccounts() {
  const { user } = await getAuth();

  if (!user) return;

  const xeroToken = await getXeroTokenInfo(user.id);

  if (!xeroToken) return;

  if (!xeroToken.accessValid || xeroToken.accessExpiringSoon) {
    await getValidXeroToken(user.id);
  }

  const tokenSetParameters = mapToken(user.xeroTokens[0]);

  try {
    await xeroClient.setTokenSet(tokenSetParameters);

    const tenantId = user.xeroTokens[0].tenantId;
    if (!tenantId) return;

    const where = 'Status=="ACTIVE" AND Type=="BANK"';
    const response = await xeroClient.accountingApi.getAccounts(
      tenantId,
      undefined,
      where
    );

    return response;
  } catch (err) {
    console.error(`Error fetching xero Accounts => ${err}`);
  }
}
