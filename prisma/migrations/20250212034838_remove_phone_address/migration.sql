/*
  Warnings:

  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "phone";
