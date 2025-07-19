"use server";
import { getAuth } from "@/auth/cookie";
import { createAgreement, buildBankLink } from "@/lib/goCardlessClient";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function createBankLink(
  bankId: string,
  formData: FormData
) {
  const { user } = await getAuth();

  if (!user) {
    return formData;
  }

  let externalLink;

  try {
    const token = user.goCardlessTokens[0];

    const hasBankAgreement = await prisma.bankAgreement.findFirst({
      where: { institutionId: bankId, userId: user.id },
    });

    if (hasBankAgreement) {
      return formData;
    }

    const {
      id: agreement,
      institution_id,
      created,
      max_historical_days,
      access_valid_for_days,
      accepted,
    } = await createAgreement(bankId, token.accessToken);

    if (agreement) {
      await prisma.bankAgreement.create({
        data: {
          agreement,
          maxHistoricalDays: max_historical_days,
          accessValidForDays: access_valid_for_days,
          createdAt: created,
          acceptedAt: accepted,
          institutionId: institution_id,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      const {
        id: requisitionId,
        status,
        created: createdAtBankLink,
        link,
      } = await buildBankLink(institution_id, agreement, token.accessToken);

      if (requisitionId) {
        await prisma.bankLink.create({
          data: {
            requisitionId,
            status: status as string,
            createdAt: new Date(createdAtBankLink as string),
            link: link,
            agreement: {
              connect: {
                agreement,
              },
            },
          },
        });

        externalLink = link;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (externalLink) {
      revalidatePath("/dashboard");
      redirect(externalLink);
    }
  }

  return formData;
}
