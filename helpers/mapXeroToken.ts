import type { XeroToken } from "@/lib/generated/prisma";
import type { TokenSetParameters } from "xero-node";

export function mapToken(token: XeroToken): TokenSetParameters {
  return {
    access_token: token.accessToken,
    id_token: token.tokenId as string,
    refresh_token: token.refreshToken,
  };
}
