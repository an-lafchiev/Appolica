"use client";
import React, { useState } from "react";

import { Button } from "../components/ui/button";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  RotateCcw,
  CreditCard,
  Landmark,
  PiggyBank,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "@/auth/actions/sign-out";
import { useDashboard } from "./dashboardContext";
export default function Nav() {
  const {
    currentView,
    showBalance,
    setShowBalance,
    selectedAccount,
    setCurrentView,
    institutions,
  } = useDashboard();

  const getAccountIcon = (iconName) => {
    switch (iconName) {
      case "Wallet":
        return <Wallet className="w-5 h-5" />;
      case "PiggyBank":
        return <PiggyBank className="w-5 h-5" />;
      case "Landmark":
        return <Landmark className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  if (currentView === "dashboard") {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8">
                  <Image
                    src="/logo_min.webp"
                    height={40}
                    width={120}
                    alt="appolica "
                  />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center space-x-2"
              >
                {showBalance ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span>{showBalance ? "Hide" : "Show"} Balances</span>
              </Button>
              <Button
                size="sm"
                className="flex items-center space-x-2 cursor-pointer"
                onClick={async () => {
                  await signOut();
                }}
              >
                <span>Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (selectedAccount) {
    const bankName = institutions.find(
      (i) => i.id === selectedAccount.institutionId
    )?.name;

    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {getAccountIcon("Wallet")}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {selectedAccount.name}
                  </h1>
                  <p className="text-sm text-gray-600">{bankName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Sync
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
