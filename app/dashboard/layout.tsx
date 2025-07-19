import { redirect } from "next/navigation";
import { getAuth } from "@/auth/cookie";
import Nav from "./Nav";
import { getInstitutions } from "@/lib/goCardlessClient";
import { DashboardProvider } from "./dashboardContext";
import { prisma } from "@/lib/prisma";
import { mapBankList } from "@/helpers/mapBankList";
import feedAccountData from "../api/GoCardless/actions/feedAccountData";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const token = user.goCardlessTokens[0];
  const institutions = await getInstitutions(token.accessToken);

  const connectedBanks = await prisma.bankLink.findMany({
    where: {
      agreement: {
        userId: user.id,
      },
    },
    include: { agreement: true },
  });

  const bankList = mapBankList(connectedBanks, institutions);
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
    include: { balance: true, transactions: true },
  });

  const filteredBankAccounts = bankAccounts.filter(
    (account) => !account.balance && !account.transactions
  );

  if (filteredBankAccounts.length > 0) {
    await feedAccountData(filteredBankAccounts);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardProvider
        user={user}
        institutions={institutions}
        connectedBanks={connectedBanks}
        bankAccounts={bankAccounts}
        bankList={bankList}
      >
        <Nav />
        {children}
      </DashboardProvider>
    </div>
  );
}
