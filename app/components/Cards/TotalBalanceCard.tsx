import { formatCurrency } from "@/helpers";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useDashboard } from "@/app/dashboard/dashboardContext";
import { getBgnBalance, getEurBalance } from "@/helpers/formatCurrency";

export default function TotalBalanceCard() {
  const { bankAccounts } = useDashboard();

  const TotalAmountEUR = getEurBalance(bankAccounts);
  const TotalAmountBGN = getBgnBalance(bankAccounts);
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-medium">Total Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatCurrency(TotalAmountEUR, "EUR")}
        </div>
        <div className="text-3xl font-bold">
          {formatCurrency(TotalAmountBGN)}
        </div>
        <p className="text-blue-100 text-sm mt-1">Across all accounts</p>
      </CardContent>
    </Card>
  );
}
