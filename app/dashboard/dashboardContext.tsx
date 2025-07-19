"use client";
import { MappedBank } from "@/helpers/mapBankList";
import { BankLink, Prisma } from "@/lib/generated/prisma";
import React, { ReactNode, useContext, useState } from "react";
import type { BankAccountWithRelations } from "../api/GoCardless/actions/feedAccountData";

const DashboardContext = React.createContext<DashboardContextType | null>(null);

const DashboardProvider = ({
  user,
  institutions,
  children,
  bankList,
  bankAccounts,
  filteredBankAccounts,
  connectedBanks,
}: DashboardProviderProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const [currentView, setCurrentView] = useState<
    "dashboard" | "account-details"
  >("dashboard");
  const [selectedAccount, setSelectedAccount] =
    useState<BankAccountWithRelations | null>(null);

  const handleSelectBankAccount = (account: BankAccountWithRelations) => {
    setSelectedAccount(account);
  };

  const value: DashboardContextType = {
    user,
    institutions,
    showBalance,
    filteredBankAccounts,
    currentView,
    bankAccounts,
    selectedAccount,
    connectedBanks,
    bankList,
    setSelectedAccount: handleSelectBankAccount,
    setCurrentView,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

const useDashboard = () => {
  const dashboardContext = useContext(DashboardContext);

  if (!dashboardContext) {
    throw new Error(
      "useDashboard has to be used within <DashboardContext.Provider>"
    );
  }

  return dashboardContext;
};

type UserWithRelations = Prisma.UserGetPayload<{
  include: { goCardlessTokens: true };
}>;

interface DashboardContextType {
  user: UserWithRelations | null;
  institutions: Instituion[];
  showBalance: boolean;
  currentView: "dashboard" | "account-details";
  selectedAccount: BankAccountWithRelations | null;
  bankList: MappedBank[];
  bankAccounts: BankAccountWithRelations[];
  filteredBankAccounts: BankAccountWithRelations[];
  connectedBanks: BankLink[];
  setSelectedAccount: (account: BankAccountWithRelations) => void;
  setCurrentView: (view: "dashboard" | "account-details") => void;
}

export interface Instituion {
  id: string;
  name: string;
  bic?: string;
  transaction_total_days: string;
  max_access_valid_for_days?: string;
  countries: string[];
  logo: string;
}
interface DashboardProviderProps {
  children: ReactNode;
  user: UserWithRelations;
  bankList: MappedBank[];
  bankAccounts: BankAccountWithRelations[];
  connectedBanks: BankLink[];
  filteredBankAccounts: BankAccountWithRelations[];
  institutions: Instituion[];
}

export { DashboardContext, useDashboard, DashboardProvider };
