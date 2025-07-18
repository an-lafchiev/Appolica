"use server";

import { getAuth } from "@/auth/cookie";
import { listBankAccounts } from "@/lib/goCardlessClient";
import { revalidatePath } from "next/cache";

export default async function getBankAccounts(requisitionId: string) {
  const { user } = await getAuth();

  try {
    if (!user) return;

    const token = user.goCardlessTokens[0];
    const bankAccounts = await listBankAccounts(
      requisitionId,
      token.accessToken
    );

    revalidatePath("/dashboard");
    return bankAccounts;
  } catch (error) {
    console.error(error);
  }
}
