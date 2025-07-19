"use server";

import { getXeroAuthUrl } from "@/lib/xero/xeroAuth";
import { redirect } from "next/navigation";

export default async function buildXeroConsent() {
  const xeroURL = await getXeroAuthUrl();
  redirect(xeroURL);
}
