"use server";

import { getAuth } from "@/auth/cookie";
import { addSecondsToNow } from "@/helpers/formatDateNow";
import { isTokenExpiringSoon } from "@/helpers/isTokenExpiring";
import { SESSION_REFRESH_INTERVAL_MS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, refreshXeroToken } from "@/lib/xero/xeroAuth";
import xero from "@/lib/xero/xeroClient";
import { redirect } from "next/navigation";

export default async function setupXeroAuth(code: string) {
  const { user } = await getAuth();

  if (!user) {
    return;
  }

  const fullPath = `${process.env.APP_URL}/dashboard/?${code}`;
  const { expires_in, refresh_token, access_token, id_token } =
    await exchangeCodeForToken(fullPath);

  const now = new Date();
  const accessExpires = addSecondsToNow(expires_in || 0);

  const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 4; // 60 days
  await xero.updateTenants();

  const xeroTenantId = xero.tenants[0].tenantId;

  await prisma.xeroToken.upsert({
    where: { userId: user.id },
    update: {
      accessToken: access_token,
      accessExpires,
      refreshToken: refresh_token,
      updatedAt: now,
      tokenId: id_token,
    },
    create: {
      userId: user.id,
      accessToken: access_token || "",
      accessExpires,
      refreshToken: refresh_token || "",
      refreshExpires: new Date(Date.now() + SESSION_MAX_DURATION_MS),
      updatedAt: now,
      tokenId: id_token,
      tenantId: xeroTenantId,
    },
  });

  redirect("/dashboard");
}

export async function getXeroTokenInfo(userId: string) {
  const tokenRecord = await prisma.xeroToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) return null;

  const now = new Date();

  return {
    hasToken: true,
    accessExpires: tokenRecord.accessExpires.toISOString(),
    refreshExpires: tokenRecord.refreshExpires.toISOString(),
    accessValid: tokenRecord.accessExpires > now,
    refreshValid: tokenRecord.refreshExpires > now,
    accessExpiringSoon: isTokenExpiringSoon(tokenRecord.accessExpires),
    timeUntilAccessExpiry: Math.max(
      0,
      tokenRecord.accessExpires.getTime() - now.getTime()
    ),
  };
}

export async function getValidXeroToken(
  userId: string
): Promise<string | null> {
  const now = new Date();

  const tokenRecord = await prisma.xeroToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) return null;

  if (!isTokenExpiringSoon(tokenRecord.accessExpires)) {
    return tokenRecord.accessToken;
  }

  if (tokenRecord.refreshExpires > now) {
    try {
      const { access_token, id_token, expires_in } = await refreshXeroToken(
        tokenRecord.refreshToken
      );

      if (access_token) {
        const now = new Date();
        const newAccessExpires = addSecondsToNow(expires_in || 0);
        const xeroToken = await prisma.xeroToken.update({
          where: { userId },
          data: {
            accessToken: access_token,
            accessExpires: newAccessExpires,
            updatedAt: now,
            tokenId: id_token,
          },
        });
        return xeroToken.accessToken;
      }
    } catch (error) {
      console.error(error);
    }
  }

  return null;
}

export async function deleteXeroToken(userId: string) {
  return await prisma.xeroToken.delete({
    where: { userId },
  });
}
