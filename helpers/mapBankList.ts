import { Instituion } from "@/app/dashboard/dashboardContext";
import { Prisma } from "@/lib/generated/prisma";

type BankLinkWithRelations = Prisma.BankLinkGetPayload<{
  include: { agreement: true };
}>;

export interface MappedBank {
  id: string;
  name: string;
  logo: string;
  status: string;
  accountCount: number;
  lastSync: Date;
  country: string;
}

export const mapBankList = (
  connectedBanks: BankLinkWithRelations[],
  institutions: Instituion[]
) => {
  return connectedBanks.reduce((acc, curr) => {
    const bank = institutions.find(
      (i) => i.id === curr.agreement.institutionId
    );

    if (bank) {
      acc.push({
        id: curr.id,
        name: bank.name,
        logo: bank.logo,
        status: curr.status,
        accountCount: curr.accountCount,
        lastSync: curr.updatedAt,
        country: "BG",
      });
    }
    return acc;
  }, [] as MappedBank[]);
};
