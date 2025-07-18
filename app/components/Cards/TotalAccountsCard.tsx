import { useDashboard } from "@/app/dashboard/dashboardContext";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function TotalAccountsCard() {
  const { bankAccounts } = useDashboard();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-900">
          Total Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">
          {bankAccounts.length}
        </div>
        <p className="text-gray-600 text-sm mt-1">Active accounts</p>
      </CardContent>
    </Card>
  );
}
