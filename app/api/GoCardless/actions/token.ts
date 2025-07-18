"use server";

import { prisma } from "@/lib/prisma";
import { refreshToken, generateToken } from "@/lib/goCardlessClient";

export interface GoCardlessTokenResponse {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

interface GoCardlessRefreshResponse {
  access: string;
  access_expires: number;
}

function addSecondsToNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

function isTokenExpiringSoon(
  expiresAt: Date,
  bufferMinutes: number = 5
): boolean {
  const now = new Date();
  const bufferTime = bufferMinutes * 60 * 1000;
  return expiresAt.getTime() - now.getTime() < bufferTime;
}

export async function saveToken(
  userId: string,
  tokenResponse: GoCardlessTokenResponse
) {
  const now = new Date();
  const accessExpires = addSecondsToNow(tokenResponse.access_expires);
  const refreshExpires = addSecondsToNow(tokenResponse.refresh_expires);

  return await prisma.goCardlessToken.upsert({
    where: { userId },
    update: {
      accessToken: tokenResponse.access,
      accessExpires,
      refreshToken: tokenResponse.refresh,
      refreshExpires,
      updatedAt: now,
    },
    create: {
      userId,
      accessToken: tokenResponse.access,
      accessExpires,
      refreshToken: tokenResponse.refresh,
      refreshExpires,
    },
  });
}

async function updateAccessToken(
  userId: string,
  refreshResponse: GoCardlessRefreshResponse
) {
  const now = new Date();
  const accessExpires = addSecondsToNow(refreshResponse.access_expires);

  return await prisma.goCardlessToken.update({
    where: { userId },
    data: {
      accessToken: refreshResponse.access,
      accessExpires,
      updatedAt: now,
    },
  });
}

export async function getTokenInfo(userId: string) {
  const tokenRecord = await prisma.goCardlessToken.findUnique({
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
    timeUntilRefreshExpiry: Math.max(
      0,
      tokenRecord.refreshExpires.getTime() - now.getTime()
    ),
  };
}

export async function getValidAccessToken(
  userId: string
): Promise<string | null> {
  const now = new Date();

  const tokenRecord = await prisma.goCardlessToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) return null;

  if (!isTokenExpiringSoon(tokenRecord.accessExpires)) {
    return tokenRecord.accessToken;
  }

  if (tokenRecord.refreshExpires > now) {
    try {
      const { access_expires, access } = await refreshToken(
        tokenRecord.refreshToken
      );
      if (access) {
        await updateAccessToken(userId, {
          access,
          access_expires,
        });
        return access;
      }
    } catch (error) {
      console.error(error);
    }
  }

  return null;
}

export async function deleteToken(userId: string) {
  return await prisma.goCardlessToken.delete({
    where: { userId },
  });
}
