import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useDashboard } from "@/app/dashboard/dashboardContext";

export default function BankDetails() {
  const { selectedAccount, institutions } = useDashboard();

  if (!selectedAccount) return null;

  const bankName = institutions.find(
    (i) => i.id === selectedAccount.institutionId
  )?.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Bank Name</p>
          <p className="font-medium">{bankName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Last Transaction</p>
          {/* <p className="font-medium">
            {new Date(selectedAccount.lastTransaction).toLocaleDateString()}
          </p> */}
        </div>
        <div>
          <p className="text-sm text-gray-600">Connection Status</p>
          <Badge className="bg-green-100 text-green-800">Connected</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
