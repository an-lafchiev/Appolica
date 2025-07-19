import xeroClient from "./xeroClient";
import { TokenSet } from "xero-node";

export async function getXeroAuthUrl(): Promise<string> {
  return await xeroClient.buildConsentUrl();
}

export async function exchangeCodeForToken(code: string): Promise<TokenSet> {
  const tokenSet = await xeroClient.apiCallback(code);
  return tokenSet;
}

export async function refreshXeroToken(
  refreshToken: string
): Promise<TokenSet> {
  const tokenSet = await xeroClient.refreshWithRefreshToken(
    process.env.XERO_CLIENT_ID,
    process.env.XERO_SECRET,
    refreshToken
  );
  return tokenSet;
}
