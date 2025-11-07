/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Organization" DROP CONSTRAINT "Organization_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."Organization_ownerId_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified";
