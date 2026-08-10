-- AlterTable Entry: 사용자 선택 거래 날짜
ALTER TABLE "Entry" ADD COLUMN "valueDate" TIMESTAMP(3);

-- AlterTable Account: 비고
ALTER TABLE "Account" ADD COLUMN "note" TEXT;
