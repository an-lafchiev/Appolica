"use client";
import { useEffect } from "react";

import DashboardView from "./DashboardView";
import { useSearchParams } from "next/navigation";
import syncBankAccounts from "../api/GoCardless/actions/syncBankAccounts";
import { useDashboard } from "./dashboardContext";
import AccountDetails from "./AccountDetails";

const Dashboard = () => {
  const { currentView } = useDashboard();

  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref && ref.length === 36) {
      (async () => {
        await syncBankAccounts(ref);
      })();
    }
  }, [ref]);

  if (currentView === "dashboard") {
    return <DashboardView />;
  }

  if (currentView === "account-details") {
    return <AccountDetails />;
  }

  return null;
};

export default Dashboard;
