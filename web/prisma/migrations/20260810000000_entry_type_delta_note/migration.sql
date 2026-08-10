-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('BALANCE', 'DEPOSIT', 'WITHDRAWAL', 'INVEST_RETURN');

-- AlterTable
ALTER TABLE "Entry"
  ADD COLUMN "entryType" "EntryType" NOT NULL DEFAULT 'BALANCE',
  ADD COLUMN "deltaKrw"  BIGINT,
  ADD COLUMN "note"      TEXT;
