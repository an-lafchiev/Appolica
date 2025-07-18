import { ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { TabsContent } from "@/app/components/ui/tabs";
import { useDashboard } from "../../dashboardContext";
import BankAccountCard from "@/app/components/Cards/BankAccountCard";
import { BankAccountWithRelations } from "@/app/api/GoCardless/actions/feedAccountData";

export default function AccountList() {
  const { bankAccounts, setSelectedAccount, setCurrentView } = useDashboard();

  const handleAccountClick = (account: BankAccountWithRelations) => {
    setSelectedAccount(account);
    setCurrentView("account-details");
  };

  return (
    <TabsContent value="accounts" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Bank Accounts</h2>
        <Button variant="outline" className="flex items-center space-x-2">
          <ExternalLink className="w-4 h-4" />
          <span>Export Data</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bankAccounts.map((account) => (
          <BankAccountCard
            key={account.id}
            account={account}
            onClick={handleAccountClick}
          />
        ))}
      </div>
    </TabsContent>
  );
}
