import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { formatCurrency } from "@/helpers";
import { useDashboard } from "@/app/dashboard/dashboardContext";
import { CONNECTED } from "@/lib/constants";

const calculateTotal = (
  availableBalance?: string | null,
  pendingBalance?: string | null
) => {
  if (availableBalance && pendingBalance) {
    return parseInt(availableBalance) + parseInt(pendingBalance);
  }

  if (availableBalance) {
    return parseInt(availableBalance);
  }
  if (pendingBalance) {
    return parseInt(pendingBalance);
  }

  return 0;
};
export default function BalanceCard() {
  const { selectedAccount } = useDashboard();

  if (!selectedAccount) {
    return null;
  }

  const availableBalance = selectedAccount.balance?.balanceAvailable;
  const pendingBalance = selectedAccount.balance?.balanceExpected;

  const totalAccountBalance = calculateTotal(availableBalance, pendingBalance);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between flex-col">
          <span>Account Balance</span>
          {selectedAccount.status && (
            <Badge
              className={
                selectedAccount.status === CONNECTED
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {selectedAccount.status}
            </Badge>
          )}
          {selectedAccount.currency && (
            <div className="text-4xl pt-4 font-bold text-gray-900 mb-2">
              {formatCurrency(totalAccountBalance, selectedAccount.currency)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableBalance && selectedAccount.currency && (
          <div className="text-2xl font-bold text-blue-800 mb-2">
            {formatCurrency(
              parseInt(availableBalance),
              selectedAccount.currency
            )}
          </div>
        )}
        <p className="text-gray-600 mb-6">Available balance</p>
        {pendingBalance && selectedAccount.currency && (
          <div className="text-2xl font-bold text-yellow-800 mb-2">
            {formatCurrency(parseInt(pendingBalance), selectedAccount.currency)}
          </div>
        )}
        <p className="text-gray-600">Expected soon</p>
      </CardContent>
    </Card>
  );
}
