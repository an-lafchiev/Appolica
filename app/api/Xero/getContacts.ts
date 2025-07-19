"use server";
import { getAuth } from "@/auth/cookie";
import xeroClient from "@/lib/xero/xeroClient";
import { getValidXeroToken, getXeroTokenInfo } from "./setupXeroAuth";
import { mapToken } from "@/helpers/mapXeroToken";

export default async function getContacts() {
  const { user } = await getAuth();

  if (!user) return;

  const xeroToken = await getXeroTokenInfo(user.id);

  if (!xeroToken) return;

  if (!xeroToken.accessValid || xeroToken.accessExpiringSoon) {
    await getValidXeroToken(user.id);
  }

  const tokenSetParameters = mapToken(user.xeroTokens[0]);

  await xeroClient.setTokenSet(tokenSetParameters);

  const tenantId = user.xeroTokens[0].tenantId;
  if (!tenantId) return;

  const where = 'ContactStatus=="ACTIVE"';
  const order = "Name ASC";
  const page = 1;
  const iDs = undefined;
  const includeArchived = false;
  const ifModifiedSince = undefined;
  const summaryOnly = true;
  const searchTerm = undefined;
  const pageSize = 100;
  try {
    const response = await xeroClient.accountingApi.getContacts(
      tenantId,
      ifModifiedSince,
      where,
      order,
      iDs,
      page,
      includeArchived,
      summaryOnly,
      searchTerm,
      pageSize
    );

    return response;
  } catch (err) {
    console.log(`Error fetching contacts: ${err}`);
  }
}
