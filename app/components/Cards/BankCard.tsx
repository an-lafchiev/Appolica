import { Settings, RotateCcw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { MappedBank } from "@/helpers/mapBankList";
import Image from "next/image";
import { formatStatus, getStatusColor } from "@/helpers/formatStatus";

export default function BankCard({ bank }: { bank: MappedBank }) {
  const bankStatus = formatStatus(bank.status);
  return (
    <Card
      key={bank.id}
      className="hover:shadow-lg transition-shadow duration-200"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full text-white font-bold text-lg">
              <Image src={bank.logo} height={50} width={50} alt={bank.name} />
            </div>
            <div>
              <CardTitle className="text-base">{bank.name}</CardTitle>
              <CardDescription className="text-sm">
                {bank.country}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(bank.status)}>{bankStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Accounts</span>
          <span className="font-medium">{bank.accountCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Last sync</span>
          <span className="text-sm font-medium">
            {bank.lastSync.toDateString()}
          </span>
        </div>
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-1" />
            Sync
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
