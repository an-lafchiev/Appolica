-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoCardlessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessExpires" DATETIME NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "refreshExpires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GoCardlessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XeroToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenId" TEXT,
    "accessExpires" DATETIME NOT NULL,
    "refreshExpires" DATETIME NOT NULL,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "XeroToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maxHistoricalDays" INTEGER NOT NULL,
    "accessValidForDays" INTEGER NOT NULL,
    "acceptedAt" DATETIME,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agreement" TEXT NOT NULL,
    CONSTRAINT "BankAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requisitionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountCount" INTEGER NOT NULL DEFAULT 0,
    "agreementId" TEXT NOT NULL,
    CONSTRAINT "BankLink_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "BankAgreement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "cashAccountType" TEXT,
    "currency" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "owner" TEXT,
    "name" TEXT,
    "product" TEXT,
    "institutionId" TEXT,
    "resourceId" TEXT,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "BankAccount_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "BankLink" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balanceAvailable" TEXT,
    "balanceExpected" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BankAccount" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "AccountTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BankAccount" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookedTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT,
    "transactionCode" TEXT,
    "entryReference" TEXT,
    "creditorName" TEXT,
    "debtorName" TEXT,
    "type" TEXT,
    "amount" TEXT NOT NULL,
    "valueDate" DATETIME,
    "xeroSynced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountTransactionId" TEXT,
    CONSTRAINT "BookedTransaction_accountTransactionId_fkey" FOREIGN KEY ("accountTransactionId") REFERENCES "AccountTransaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT,
    "transactionCode" TEXT,
    "entryReference" TEXT,
    "creditorName" TEXT,
    "type" TEXT,
    "amount" TEXT NOT NULL,
    "valueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountTransactionId" TEXT,
    CONSTRAINT "PendingTransaction_accountTransactionId_fkey" FOREIGN KEY ("accountTransactionId") REFERENCES "AccountTransaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoCardlessToken_userId_key" ON "GoCardlessToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XeroToken_userId_key" ON "XeroToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAgreement_agreement_key" ON "BankAgreement"("agreement");

-- CreateIndex
CREATE UNIQUE INDEX "BankLink_requisitionId_key" ON "BankLink"("requisitionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankLink_agreementId_key" ON "BankLink"("agreementId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_accountId_key" ON "BankAccount"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_iban_key" ON "BankAccount"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_bic_key" ON "BankAccount"("bic");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_accountId_key" ON "AccountBalance"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountTransaction_accountId_key" ON "AccountTransaction"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BookedTransaction_transactionId_key" ON "BookedTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingTransaction_transactionId_key" ON "PendingTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_name_key" ON "Contact"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_contactId_key" ON "Contact"("contactId");
