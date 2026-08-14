import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EditEntryForm, type EntryForEdit } from "./form";

function toDateLocal(date: Date | null): string {
  if (!date) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      account: {
        select: { familyId: true, name: true, currency: true },
      },
    },
  });

  if (!entry || entry.account.familyId !== session.familyId) notFound();

  // 이 내역 직전의 잔액 (이 내역 자체 제외)
  const effectiveDate = entry.valueDate ?? entry.recordedAt;
  const prevEntry = await prisma.entry.findFirst({
    where: {
      accountId: entry.accountId,
      id: { not: entry.id },
      OR: [
        { valueDate: { lte: effectiveDate } },
        { valueDate: null, recordedAt: { lte: effectiveDate } },
      ],
    },
    orderBy: [
      { valueDate: { sort: "desc", nulls: "last" } },
      { recordedAt: "desc" },
    ],
    select: { amountKrw: true },
  });
  const prevBalanceKrw = prevEntry ? Number(prevEntry.amountKrw) : 0;

  // 초기 금액 (원화 기준 또는 원화 환산 전 원본 금액)
  let initialAmount = "";
  const currency = entry.originalCurrency ?? entry.account.currency;

  if (entry.entryType === "BALANCE") {
    initialAmount = entry.originalAmount
      ? entry.originalAmount.toString()
      : Number(entry.amountKrw).toString();
  } else if (entry.entryType === "DEPOSIT") {
    initialAmount = entry.originalAmount
      ? entry.originalAmount.toString()
      : Math.abs(Number(entry.deltaKrw ?? entry.amountKrw)).toString();
  } else if (entry.entryType === "WITHDRAWAL") {
    initialAmount = entry.originalAmount
      ? entry.originalAmount.toString()
      : Math.abs(Number(entry.deltaKrw ?? entry.amountKrw)).toString();
  } else if (entry.entryType === "INVEST_RETURN") {
    initialAmount = Number(entry.deltaKrw ?? 0).toString();
  }

  const entryForEdit: EntryForEdit = {
    id: entry.id,
    accountId: entry.accountId,
    accountName: entry.account.name,
    entryType: entry.entryType,
    initialAmount,
    initialFxRate: entry.fxRateUsed ? entry.fxRateUsed.toString() : "",
    currency,
    note: entry.note ?? "",
    valueDate: toDateLocal(entry.valueDate ?? entry.recordedAt),
    prevBalanceKrw,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <Link href={`/accounts/${entry.accountId}/history`} className="w-10 h-10 flex items-center justify-center rounded-[8px] text-[22px] text-muted hover:bg-hairline transition-colors">‹</Link>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold text-ink">내역 수정</p>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full animate-fade-up">
        <EditEntryForm entry={entryForEdit} />
      </main>
    </div>
  );
}
