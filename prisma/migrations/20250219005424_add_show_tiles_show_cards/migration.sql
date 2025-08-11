-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "showCards" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTiles" BOOLEAN NOT NULL DEFAULT true;
