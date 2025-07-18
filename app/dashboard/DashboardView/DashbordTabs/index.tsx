"use client";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import AccountList from "./AccountList";
import BankList from "./BankList";
import { useState } from "react";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("banks");
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:w-96">
        <TabsTrigger value="banks">Connected Banks</TabsTrigger>
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
      </TabsList>

      <BankList />
      <AccountList />
    </Tabs>
  );
}
