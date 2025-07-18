import ConnectedBanksCard from "@/app/components/Cards/ConnectedBanksCard";
import TotalAccountsCard from "@/app/components/Cards/TotalAccountsCard";
import TotalBalanceCard from "@/app/components/Cards/TotalBalanceCard";
import DashboardTabs from "./DashbordTabs";

export default function DashboardView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <TotalBalanceCard />
        <ConnectedBanksCard />
        <TotalAccountsCard />
      </div>

      <DashboardTabs />
    </div>
  );
}
