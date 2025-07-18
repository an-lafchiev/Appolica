import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useDashboard } from "@/app/dashboard/dashboardContext";

export default function AccountDetailsCard() {
  const { selectedAccount, bankAccounts } = useDashboard();

  const account = bankAccounts.find(
    (acc) => acc.accountId === selectedAccount?.accountId
  );

  if (!account) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Account Number</p>
          <p className="font-medium">{account.resourceId}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">IBAN</p>
          <p className="font-medium text-sm">{account.iban}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">BIC</p>
          <p className="font-medium">{account.bic}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Account Type</p>
          <Badge variant="secondary" className="capitalize">
            {account.cashAccountType}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-600">Currency</p>
          <p className="font-medium">{account.currency}</p>
        </div>
        {account.status && (
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">{account.status}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
