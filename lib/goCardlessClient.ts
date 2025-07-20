import createClient from "openapi-fetch";
import type { paths } from "@/app/api/GoCardless/types";
import { GoCardlessTokenResponse } from "@/app/api/GoCardless/actions/token";

const { GET, POST, PUT, DELETE } = createClient<paths>({
  baseUrl: process.env.NORDIGEN_BASE_URL,
});

export const generateToken = async (): Promise<GoCardlessTokenResponse> => {
  const { data, error } = await POST("/api/v2/token/new/", {
    body: {
      secret_id: process.env.SECRET_ID!,
      secret_key: process.env.SECRET_KEY!,
    },
  });

  if (error) throw new Error("Error generating GoCardless token:");

  return data as GoCardlessTokenResponse;
};

export const refreshToken = async (refreshToken: string) => {
  const { data, error } = await POST("/api/v2/token/refresh/", {
    body: {
      refresh: refreshToken,
    },
  });

  if (error) throw new Error("Error refreshing GoCardless token:");

  return data;
};

export const getInstitutions = async (access: string) => {
  const SANDBOX = {
    id: "SANDBOXFINANCE_SFIN0000",
    name: "SANDBOX FINANCE",
    bic: "SFIN0000",
    transaction_total_days: "90",
    max_access_valid_for_days: "90",
    countries: ["BG"],
    logo: "/gocardless.png",
  };
  const { data, error } = await GET("/api/v2/institutions/", {
    params: {
      query: {
        country: "BG",
      },
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) {
    throw new Error("Error fetching institutions");
  }

  return [...data, SANDBOX];
};

export const createAgreement = async (
  institutionId: string,
  access: string
) => {
  const { data, error } = await POST("/api/v2/agreements/enduser/", {
    body: {
      institution_id: institutionId,
      max_historical_days: 90,
      access_valid_for_days: 90,
      access_scope: ["balances", "details", "transactions"],
      reconfirmation: false,
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error creating EUA");

  return data;
};

export const buildBankLink = async (
  institutionId: string,
  agreement: string,
  access: string
) => {
  const { data, error } = await POST("/api/v2/requisitions/", {
    body: {
      institution_id: institutionId,
      redirect: `${process.env.APP_URL}/dashboard`,
      agreement,
      redirect_immediate: false,
      account_selection: false,
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error building a bank link");

  return data;
};

export const listBankAccounts = async (
  requisitionId: string,
  access: string
) => {
  const { data, error } = await GET("/api/v2/requisitions/{id}/", {
    params: {
      path: {
        id: requisitionId,
      },
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error fetching account list");

  return data;
};

export const getAccount = async (accountId: string, access: string) => {
  const { data, error } = await GET("/api/v2/accounts/{id}/", {
    params: {
      path: {
        id: accountId,
      },
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error fetching account details");

  return data;
};

export const getAccountBalance = async (accountId: string, access: string) => {
  const { data, error } = await GET("/api/v2/accounts/{id}/balances/", {
    params: {
      path: {
        id: accountId,
      },
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error fetching account balances");

  return data;
};
export const getAccountTransactions = async (
  accountId: string,
  access: string,
  dateRangeFrom?: string,
  dateRangeTo?: string
) => {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateTo.getDate() - 30);

  const dateFromStr = dateRangeFrom || dateFrom.toISOString().split("T")[0];
  const dateToStr = dateRangeTo || dateTo.toISOString().split("T")[0];

  const { data, error } = await GET("/api/v2/accounts/{id}/transactions/", {
    params: {
      query: {
        date_from: dateFromStr,
        date_to: dateToStr,
      },
      path: {
        id: accountId,
      },
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error fetching account transactions");

  return data;
};

export const getAccountDetails = async (accountId: string, access: string) => {
  const { data, error } = await GET("/api/v2/accounts/{id}/details/", {
    params: {
      path: {
        id: accountId,
      },
    },
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (error) throw new Error("Error fetching account details");

  return data;
};
