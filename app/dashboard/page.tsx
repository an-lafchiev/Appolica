"use client";
import { useEffect } from "react";

import DashboardView from "./DashboardView";
import { useSearchParams } from "next/navigation";
import syncBankAccounts from "../api/GoCardless/actions/syncBankAccounts";
import { useDashboard } from "./dashboardContext";
import AccountDetails from "./AccountDetails";
import setupXeroAuth from "../api/Xero/setupXeroAuth";
import feedAccountData from "../api/GoCardless/actions/feedAccountData";

const Dashboard = () => {
  const { currentView, filteredBankAccounts } = useDashboard();

  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const xeroCode = searchParams.get("code");
  const xeroQuery = searchParams.toString();

  useEffect(() => {
    if (ref && ref.length === 36) {
      (async () => {
        await syncBankAccounts(ref);
      })();
    }
  }, [ref]);

  useEffect(() => {
    if (xeroCode) {
      (async () => {
        await setupXeroAuth(xeroQuery);
      })();
    }
  }, [xeroCode, xeroQuery]);

  useEffect(() => {
    (async () => {
      if (filteredBankAccounts.length > 0) {
        await feedAccountData(filteredBankAccounts);
      }
    })();
  }, [filteredBankAccounts.length, filteredBankAccounts]);

  if (currentView === "dashboard") {
    return <DashboardView />;
  }

  if (currentView === "account-details") {
    return <AccountDetails />;
  }

  return null;
};

export default Dashboard;
