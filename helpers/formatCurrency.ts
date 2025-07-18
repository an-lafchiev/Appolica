import { BankAccountWithRelations } from "@/app/api/GoCardless/actions/feedAccountData";

export const formatCurrency = (amount: number, currency = "BGN") => {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const getEurBalance = (bankAccounts: BankAccountWithRelations[]) => {
  const totalEurBalance = bankAccounts.reduce((acc, curr) => {
    if (curr.currency !== "EUR") return acc;
    if (curr.balance) {
      return parseInt(curr.balance.balanceAvailable ?? "0") + acc;
    }
    return acc;
  }, 0);

  return totalEurBalance;
};

export const getBgnBalance = (bankAccounts: BankAccountWithRelations[]) => {
  const totalBgnBalance = bankAccounts.reduce((acc, curr) => {
    if (curr.currency !== "BGN") return acc;
    if (curr.balance) {
      return parseInt(curr.balance.balanceAvailable ?? "0") + acc;
    }
    return acc;
  }, 0);

  return totalBgnBalance;
};

export const convertEuroToBGN = (eur: number) => {
  return eur * 1.94;
};
