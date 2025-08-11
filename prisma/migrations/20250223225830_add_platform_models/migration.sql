/*
  Warnings:

  - Added the required column `type` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CulturalHub" ADD COLUMN     "activePlayers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Gaming" ADD COLUMN     "activePlayers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questCount" INTEGER NOT NULL DEFAULT 0;
