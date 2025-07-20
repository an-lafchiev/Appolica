import { mapToken } from "@/helpers/mapXeroToken";
import { NextResponse } from "next/server";
import xeroClient from "@/lib/xero/xeroClient";
import { prisma } from "@/lib/prisma";
import { BankAccount } from "@/lib/generated/prisma";
import { isTokenExpiringSoon } from "@/helpers/isTokenExpiring";
import { refreshXeroToken } from "@/lib/xero/xeroAuth";
import { addSecondsToNow } from "@/helpers/formatDateNow";
import { getAccountTransactions, refreshToken } from "@/lib/goCardlessClient";
import { createContactList } from "@/helpers/createContactList";
import {
  Account,
  BankTransaction,
  BankTransactions,
  Contact,
  Contacts,
  LineItem,
} from "xero-node";
import { buildLineItemDescription } from "@/helpers/buildLineItemDescription";

export async function GET(request: Request) {
  const authHeader = request.headers.get("x-cron-authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { xeroTokens: { some: {} }, goCardlessTokens: { some: {} } },
    include: { xeroTokens: true, goCardlessTokens: true },
  });
  if (!users.length) return;

  for (const user of users) {
    const goCardlessToken = user.goCardlessTokens[0];
    const xeroToken = user.xeroTokens[0];
    let bankAccounts: BankAccount[];
    const now = new Date();

    if (isTokenExpiringSoon(goCardlessToken.accessExpires)) {
      if (goCardlessToken.refreshExpires > now) {
        try {
          const { access_expires, access } = await refreshToken(
            goCardlessToken.refreshToken
          );
          if (access) {
            const accessExpires = addSecondsToNow(access_expires);
            await prisma.goCardlessToken.update({
              where: { userId: user.id },
              data: {
                accessToken: access,
                accessExpires,
                updatedAt: now,
              },
            });

            return access;
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (isTokenExpiringSoon(xeroToken.accessExpires)) {
      if (xeroToken.refreshExpires > now) {
        try {
          const { access_token, id_token, expires_in, refresh_token } =
            await refreshXeroToken(xeroToken.refreshToken);

          if (access_token) {
            const now = new Date();
            const newAccessExpires = addSecondsToNow(expires_in || 0);
            const xeroToken = await prisma.xeroToken.update({
              where: { userId: user.id },
              data: {
                accessToken: access_token,
                accessExpires: newAccessExpires,
                updatedAt: now,
                tokenId: id_token,
                refreshToken: refresh_token,
              },
            });
            return xeroToken.accessToken;
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (goCardlessToken && xeroToken) {
      const tokenSetParameters = mapToken(xeroToken);
      await xeroClient.setTokenSet(tokenSetParameters);

      const tenantId = xeroToken.tenantId;
      if (!tenantId) return;

      const where = 'Status=="ACTIVE" AND Type=="BANK"';

      const xeroBankAccounts = await xeroClient.accountingApi.getAccounts(
        tenantId,
        undefined,
        where
      );

      bankAccounts = await prisma.bankAccount.findMany({
        where: { userId: user.id },
      });

      const existingContacts = await prisma.contact.findMany();

      for (const bankAccount of bankAccounts) {
        const dateTo = new Date();
        const dateFrom = new Date();
        dateFrom.setDate(dateTo.getDate() - 1); // last 24h

        const { transactions } = await getAccountTransactions(
          bankAccount.accountId,
          goCardlessToken.accessToken,
          dateFrom.toISOString().split("T")[0],
          dateTo.toISOString().split("T")[0]
        );

        await prisma.accountTransaction.upsert({
          where: { accountId: bankAccount.accountId },
          create: {
            accountId: bankAccount.accountId,
            booked: {
              createMany: {
                data: (transactions.booked ?? []).map((tx) => ({
                  transactionId:
                    bankAccount.accountId + tx.internalTransactionId, // sandbox id limitation
                  entryReference: tx.entryReference,
                  creditorName: tx.creditorName,
                  debtorName: tx.debtorName,
                  type: tx.proprietaryBankTransactionCode,
                  amount: tx.transactionAmount.amount,
                  valueDate: new Date(tx.valueDate || Date.now()),
                  transactionCode: tx.bankTransactionCode,
                })),
              },
            },
            pending: {
              createMany: {
                data: (transactions.pending ?? []).map((tx) => ({
                  transactionId: bankAccount.accountId + tx.transactionId,
                  entryReference: tx.entryReference,
                  creditorName: tx.creditorName,
                  debtorName: tx.debtorName,
                  type: tx.proprietaryBankTransactionCode,
                  amount: tx.transactionAmount.amount,
                  valueDate: new Date(tx.valueDate || Date.now()),
                  transactionCode: tx.bankTransactionCode,
                })),
              },
            },
          },
          update: {},
        });

        const transactionContacts = createContactList(transactions);

        const unexistingContacts = transactionContacts.filter((contact) => {
          const existingContact = existingContacts?.find(
            (c) => c.name === contact.name
          );

          if (!existingContact) {
            return true;
          }

          return false;
        });

        if (unexistingContacts.length > 0) {
          const contacts: Contacts = {
            contacts: unexistingContacts,
          };
          const { body } = await xeroClient.accountingApi.createContacts(
            tenantId,
            contacts
          );

          if (body.contacts) {
            for (const contact of body.contacts) {
              if (contact.contactID) {
                await prisma.contact.upsert({
                  where: { contactId: contact.contactID },
                  create: {
                    contactId: contact.contactID,
                    name: contact.name as string,
                  },
                  update: {},
                });
              }
            }

            return body.contacts;
          }
        }

        const accountTransaction = await prisma.accountTransaction.findUnique({
          where: { accountId: bankAccount.accountId },
        });

        const bookedUnsyncedTransactions =
          await prisma.bookedTransaction.findMany({
            where: { accountTransactionId: accountTransaction?.id },
          });

        const mappedTransactionPromises = bookedUnsyncedTransactions.map(
          async (trx) => {
            const isSpendeture = trx.amount[0] === "-";

            const transactionContact = existingContacts.find(
              (c) => c.name === trx.creditorName || c.name === trx.debtorName
            );

            const contactId = transactionContact?.contactId;
            const contactName = transactionContact?.name;

            const contact: Contact = {
              contactID: contactId,
              name: contactName,
            };

            const xeroAccountId = xeroBankAccounts.body.accounts?.find(
              (acc) => acc.bankAccountNumber === bankAccount.iban
            );

            const xeroBankAccount: Account = {
              accountID: xeroAccountId?.accountID,
            };

            const ExpenseAccount = "429"; // General Expense
            const RevenueAccount = "200"; // Sales

            const lineItem: LineItem = {
              description: buildLineItemDescription(trx),
              quantity: 1.0,
              unitAmount: parseInt(
                isSpendeture ? trx.amount.slice(1) : trx.amount
              ),
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
          }
        );

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
      }
    }
  }
  return NextResponse.json({ success: true });
}
