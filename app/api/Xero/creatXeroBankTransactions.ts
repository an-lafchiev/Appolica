"use server";
import { getAuth } from "@/auth/cookie";
import xeroClient from "@/lib/xero/xeroClient";
import { getValidXeroToken, getXeroTokenInfo } from "./setupXeroAuth";
import { mapToken } from "@/helpers/mapXeroToken";
import {
  Account,
  BankTransaction,
  BankTransactions,
  Contact,
  LineItem,
} from "xero-node";
import { prisma } from "@/lib/prisma";
import getXeroBankAccounts from "./getXeroBankAccounts";
import createContacts from "./createContacts";
import { AccountTransaction } from "@/lib/generated/prisma";
import { buildLineItemDescription } from "@/helpers/buildLineItemDescription";

export default async function createXeroBankTransactions() {
  const { user } = await getAuth();

  if (!user) return;

  const xeroToken = await getXeroTokenInfo(user.id);

  if (!xeroToken) return;

  if (!xeroToken.accessValid || xeroToken.accessExpiringSoon) {
    await getValidXeroToken(user.id);
  }

  const tokenSetParameters = mapToken(user.xeroTokens[0]);

  const transactions = await prisma.accountTransaction.findMany({
    include: { booked: true },
  });

  const bankAccounts = await prisma.bankAccount.findMany();

  const contacts = await prisma.contact.findMany();

  const unsyncedTransactions = transactions
    .map((accountTrx) => accountTrx.booked.filter((trx) => !trx.xeroSynced))
    .flat();

  try {
    await xeroClient.setTokenSet(tokenSetParameters);

    const xeroResponse = await getXeroBankAccounts();
    const xeroBankAccounts = xeroResponse?.body.accounts;

    const tenantId = user.xeroTokens[0].tenantId;
    if (!tenantId) return;

    const mappedTransactionPromises = unsyncedTransactions.map(async (trx) => {
      const isSpendeture = trx.amount[0] === "-";

      const transactionContact = contacts.find(
        (c) => c.name === trx.creditorName || c.name === trx.debtorName
      );

      let contactId = transactionContact?.contactId;
      let contactName = transactionContact?.name;
      if (!transactionContact) {
        const cleanName = isSpendeture
          ? trx.creditorName
          : trx.debtorName?.trim().toLowerCase().replace(/\s+/g, "");

        const responseContact = await createContacts([
          {
            name: trx.creditorName as string,
            emailAddress: `${cleanName}@appolica.com`,
          },
        ]);

        if (!responseContact) return;
        contactName = responseContact[0]?.name;
        contactId = responseContact[0].contactID;
      }

      const contact: Contact = {
        contactID: contactId,
        name: contactName,
      };

      const bankAccountId = transactions.find(
        (accountTrx) => accountTrx.id === trx.accountTransactionId
      ) as AccountTransaction;
      const bankAccount = bankAccounts.find(
        (acc) => acc.accountId === bankAccountId.accountId
      );
      const xeroAccountId = xeroBankAccounts?.find(
        (acc) => acc.bankAccountNumber === bankAccount?.iban
      );

      const xeroBankAccount: Account = {
        accountID: xeroAccountId?.accountID,
      };

      const ExpenseAccount = "429"; // General Expense
      const RevenueAccount = "200"; // Sales

      const lineItem: LineItem = {
        description: buildLineItemDescription(trx),
        quantity: 1.0,
        unitAmount: parseInt(isSpendeture ? trx.amount.slice(1) : trx.amount),
        accountID: xeroAccountId?.accountID,
        taxType: isSpendeture ? "INPUT" : "OUTPUT",
        accountCode: isSpendeture ? ExpenseAccount : RevenueAccount,
      };

      return {
        type: isSpendeture
          ? BankTransaction.TypeEnum.SPEND
          : BankTransaction.TypeEnum.RECEIVE,
        lineItems: [lineItem],
        contact,
        bankAccount: xeroBankAccount,
        reference: trx.transactionId,
      } as BankTransaction;
    });

    const mappedTransaction = (
      await Promise.all(mappedTransactionPromises)
    ).filter((trx): trx is BankTransaction => trx !== undefined);

    const bankTransactions: BankTransactions = {
      bankTransactions: mappedTransaction,
    };

    const response = await xeroClient.accountingApi.createBankTransactions(
      tenantId,
      bankTransactions
    );

    const createdTransactions = response.body;

    if (createdTransactions && createdTransactions.bankTransactions) {
      await Promise.allSettled(
        createdTransactions.bankTransactions.map((bankTrx) => {
          return prisma.bookedTransaction.update({
            where: { transactionId: bankTrx.reference },
            data: {
              xeroSynced: true,
            },
          });
        })
      );
    }
  } catch (err) {
    console.log(`Error creating bank transactions: ${err}`);
  }
}
