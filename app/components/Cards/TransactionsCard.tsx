import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { useDashboard } from "@/app/dashboard/dashboardContext";
import { useEffect, useState } from "react";
import { BookedTransaction } from "@/lib/generated/prisma";
import getTransactions from "@/app/api/GoCardless/actions/getTransactions";

const TransactionRow = ({
  transaction,
}: {
  transaction: BookedTransaction;
}) => {
  const isUpwardTrend = transaction.amount[0] !== "-";

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {isUpwardTrend ? (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
        )}
        <div>
          <p className="font-medium">{transaction.type}</p>
          {transaction.valueDate && (
            <p className="text-sm text-gray-600">
              {transaction.valueDate.toDateString()}
            </p>
          )}
        </div>
      </div>
      <span
        className={
          isUpwardTrend ? "font-bold text-green-600" : "font-bold text-red-600"
        }
      >
        {transaction.amount}
      </span>
    </div>
  );
};
export default function TransactionsCard() {
  const { selectedAccount } = useDashboard();
  const [transactions, setTransactions] = useState<BookedTransaction[]>([]);

  useEffect(() => {
    (async () => {
      if (selectedAccount && selectedAccount.transactions?.id) {
        const data = await getTransactions(selectedAccount.transactions?.id);
        if (data) {
          setTransactions(data);
        }
      }
    })();
  }, [selectedAccount]);

  if (!selectedAccount) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((trx) => (
            <TransactionRow key={trx.transactionId} transaction={trx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
