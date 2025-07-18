import AccountDetailsCard from "../components/Cards/AccountDetailsCard";
import BalanceCard from "../components/Cards/BalanceCard";
import BankDetailsCard from "../components/Cards/BankDetailsCard";
import TransactionsCard from "../components/Cards/TransactionsCard";

export default function AccountDetails() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard />
          <TransactionsCard />
        </div>

        <div className="space-y-6">
          <AccountDetailsCard />
          <BankDetailsCard />
        </div>
      </div>
    </div>
  );
}
