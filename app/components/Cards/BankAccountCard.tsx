import {
  CreditCard,
  Landmark,
  ChevronRight,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { formatCurrency } from "@/helpers";
import { useDashboard } from "@/app/dashboard/dashboardContext";
import { BankAccountWithRelations } from "@/app/api/GoCardless/actions/feedAccountData";

const getAccountIcon = (iconName: string) => {
  switch (iconName) {
    case "Wallet":
      return <Wallet className="w-5 h-5" />;
    case "PiggyBank":
      return <PiggyBank className="w-5 h-5" />;
    case "Landmark":
      return <Landmark className="w-5 h-5" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
};

export default function BankAccountCard({
  account,
  onClick,
}: {
  account: BankAccountWithRelations;
  onClick: (account: BankAccountWithRelations) => void;
}) {
  const { institutions } = useDashboard();

  const bankName = institutions.find(
    (i) => i.id === account.institutionId
  )?.name;

  const availableBalance = account.balance?.balanceAvailable;

  return (
    <Card
      key={account.id}
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(account)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getAccountIcon("Wallet")}
            </div>
            <div>
              <CardTitle className="text-base">{account.name}</CardTitle>
              {bankName && (
                <CardDescription className="text-sm">
                  {bankName}
                </CardDescription>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Balance</span>
          {availableBalance && account.currency && (
            <span className="font-bold text-lg">
              {formatCurrency(parseInt(availableBalance), account.currency)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Account Number</span>
          <span className="text-sm font-medium">{account.resourceId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">IBAN</span>
          <span className="text-sm font-medium">{account.iban}</span>
        </div>
        {account.bic && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">BIC</span>
            <span className="text-sm font-medium">{account.bic}</span>
          </div>
        )}
        {account.currency && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Currency</span>
            <span className="text-sm font-medium">{account.currency}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cash Account Type</span>
          <Badge variant="secondary" className="capitalize">
            {account.cashAccountType}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
