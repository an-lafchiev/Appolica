import { TabsContent } from "@/app/components/ui/tabs";

import { SelectDialog } from "@/app/components/ui/selectDialog";
import { useDashboard } from "../../dashboardContext";
import BankCard from "@/app/components/Cards/BankCard";

export default function BankList() {
  const { institutions, bankList } = useDashboard();

  const selectItems = institutions
    .filter((i) => {
      const linkedBank = bankList.find((b) => b.name === i.name);

      if (!linkedBank) {
        return i;
      }

      return i.name !== linkedBank?.name;
    })
    .map((i) => ({
      label: i.name,
      value: i.id,
      img: i.logo,
    }));

  return (
    <TabsContent value="banks" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Connected Banks</h2>

        <SelectDialog items={selectItems} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankList.map((bank) => (
          <BankCard key={bank.id} bank={bank} />
        ))}
      </div>
    </TabsContent>
  );
}
