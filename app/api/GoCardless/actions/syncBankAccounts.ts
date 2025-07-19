"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import getBankAccounts from "./getBankAccounts";
import { getAuth } from "@/auth/cookie";
import { getAccountDetails } from "@/lib/goCardlessClient";
import { redirect } from "next/navigation";
import createAccount from "../../Xero/createAccount";

export default async function syncBankAccounts(requisitionId: string) {
  const { user } = await getAuth();
  const now = new Date();

  if (!user) return;
  try {
    const bankAccountList = await getBankAccounts(requisitionId);
    const token = user.goCardlessTokens[0];

    const bankAccounts = bankAccountList?.accounts;
    const bankLink = await prisma.bankLink.update({
      where: { requisitionId },

      data: {
        status: bankAccountList?.status || "LN",
        accountCount: bankAccounts?.length || 0,
        updatedAt: now,
      },
    });

    if (bankAccounts?.length) {
      try {
        await Promise.all(
          bankAccounts.map(async (account) => {
            try {
              const accountDetails = await getAccountDetails(
                account,
                token.accessToken
              );

              const {
                cashAccountType,
                currency,
                iban,
                name,
                ownerName,
                product,
                resourceId,
                bic,
                status,
              } = accountDetails.account;

              const accountData = {
                accountId: account,
                cashAccountType,
                currency,
                iban,
                owner: ownerName,
                name,
                product,
                bic,
                institutionId: bankAccountList?.institution_id,
                resourceId,
                status,
                agreementId: bankLink.agreementId,
                requisition: {
                  connect: { requisitionId },
                },
                user: { connect: { id: user.id } },
              };

              return prisma.bankAccount.upsert({
                where: { accountId: account },
                create: accountData,
                update: accountData,
              });
            } catch (error) {
              console.error(`Failed to process account ${account}:`, error);
              throw error;
            }
          })
        );

        await Promise.all(
          bankAccounts.map((account) => {
            try {
              return createAccount(account);
            } catch (error) {
              console.error(error);
            }
          })
        );
      } catch (error) {
        console.error("Failed to process bank accounts:", error);
        throw error;
      }
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error(error);
  }

  redirect("/dashboard");
}
