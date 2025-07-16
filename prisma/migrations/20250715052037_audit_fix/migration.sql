/*
  Warnings:

  - You are about to drop the column `companyId` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clientId` to the `Mail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Mail" DROP CONSTRAINT "Mail_companyId_fkey";

-- AlterTable
ALTER TABLE "Mail" DROP COLUMN "companyId",
ADD COLUMN     "clientId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'notified';

-- DropTable
DROP TABLE "Company";

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "secondaryEmails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_primaryEmail_key" ON "Client"("primaryEmail");

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
