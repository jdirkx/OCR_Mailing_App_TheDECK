/*
  Warnings:

  - You are about to drop the column `email` on the `Company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactEmail]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactEmail` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Company_email_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "email",
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Mail" ADD COLUMN     "collectedAt" TIMESTAMP(3),
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT DEFAULT 'pending',
ADD COLUMN     "urgency" INTEGER DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Company_contactEmail_key" ON "Company"("contactEmail");
