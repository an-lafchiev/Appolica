export interface XeroTokenSet {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string[];
}

export interface XeroTenant {
  id: string;
  authEventId: string;
  tenantId: string;
  tenantType: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export interface BankFeedConnection {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: "BANK" | "CREDITCARD";
  currency: string;
  country: string;
  accountId?: string;
  status?: "PENDING" | "ACTIVE" | "REJECTED";
  error?: string;
}

export interface BankStatementLine {
  statementLineId: string;
  postedDate: string;
  description: string;
  amount: number;
  transactionId: string;
  payeeName?: string;
  reference?: string;
  chequeNumber?: string;
}

export interface BankStatement {
  id: string;
  accountId: string;
  startDate: string;
  endDate: string;
  startBalance: number;
  endBalance: number;
  statementLines: BankStatementLine[];
}

export interface CreateStatementsRequest {
  feedConnectionId: string;
  statements: BankStatement[];
}

// types/gocardless.ts
export interface GoCardlessAccount {
  id: string;
  name: string;
  account_number: string;
  sort_code: string;
  currency: string;
  balance: number;
  institution_id: string;
  iban?: string;
}

export interface GoCardlessTransaction {
  id: string;
  account_id: string;
  amount: string;
  currency: string;
  date: string;
  description?: string;
  reference?: string;
  counterparty_name?: string;
  counterparty_account?: string;
  merchant_name?: string;
  booking_date?: string;
  value_date?: string;
}

export interface GoCardlessTransactionsResponse {
  results: GoCardlessTransaction[];
  next?: string;
  previous?: string;
  count: number;
}

// types/user.ts
export interface User {
  id: string;
  xeroAccessToken: string;
  xeroRefreshToken: string;
  xeroTenantId: string;
  goCardlessAccessToken: string;
  xeroTokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncResult {
  userId: string;
  success: boolean;
  result?: any;
  error?: string;
}
