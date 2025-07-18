import { useDashboard } from "@/app/dashboard/dashboardContext";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function ConnectedBanksCard() {
  const { bankList, institutions } = useDashboard();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-900">
          Connected Banks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">
          {bankList.length}
        </div>
        <p className="text-gray-600 text-sm mt-1">
          of {institutions.length} total
        </p>
      </CardContent>
    </Card>
  );
}
