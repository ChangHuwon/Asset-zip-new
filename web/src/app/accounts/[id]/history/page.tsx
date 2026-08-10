import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const TYPE_META = {
  BALANCE: { label: "잔액 입력", color: "#767676", bg: "#f2f2f2" },
  DEPOSIT: { label: "입금", color: "#00a699", bg: "#e6f7f6" },
  WITHDRAWAL: { label: "출금", color: "#fc642d", bg: "#fff3ef" },
  INVEST_RETURN: { label: "투자 수익", color: "#ff385c", bg: "#fff1f3" },
} as const;

function krw(amount: bigint) {
  return Number(amount).toLocaleString("ko-KR") + "원";
}

function formatDelta(delta: bigint | null, type: string) {
  if (delta === null || type === "BALANCE") return null;
  const n = Number(delta);
  const sign = n >= 0 ? "+" : "";
  return sign + n.toLocaleString("ko-KR") + "원";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function AccountHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id, familyId: session.familyId },
    select: { id: true, name: true, currency: true, category: { select: { name: true } } },
  });
  if (!account) notFound();

  const entries = await prisma.entry.findMany({
    where: { accountId: id },
    orderBy: { recordedAt: "desc" },
    include: { member: { select: { displayName: true } } },
  });

  const currentBalance = entries[0]?.amountKrw ?? BigInt(0);

  let prevDay: Date | null = null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <Link href="/dashboard" className="text-2xl text-muted leading-none">‹</Link>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold text-ink">{account.name}</p>
          <p className="text-[11px] text-muted">{account.category.name}</p>
        </div>
        <Link
          href={`/entries/new?accountId=${account.id}`}
          className="text-[13px] font-semibold text-primary"
        >
          + 추가
        </Link>
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full animate-fade-up">
        {/* 현재 잔액 카드 */}
        <div
          className="bg-canvas rounded-2xl mb-4 overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="h-1 bg-primary" />
          <div className="px-6 pt-5 pb-6">
            <p className="text-[13px] font-semibold text-muted uppercase tracking-wide mb-1">
              현재 잔액
            </p>
            <p className="text-[40px] font-bold text-ink tracking-tight leading-none">
              {krw(currentBalance)}
            </p>
            <p className="text-[13px] text-muted mt-2">
              {account.currency !== "KRW" ? `통화: ${account.currency}` : ""}
            </p>
          </div>
        </div>

        {/* 내역 없음 */}
        {entries.length === 0 && (
          <div
            className="bg-canvas rounded-2xl p-8 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <p className="text-[17px] font-semibold text-ink mb-1">아직 내역이 없습니다</p>
            <p className="text-[14px] text-muted mb-5">첫 내역을 입력해보세요.</p>
            <Link
              href={`/entries/new?accountId=${account.id}`}
              className="inline-flex h-11 items-center px-6 rounded-[10px] bg-primary text-on-primary text-[14px] font-semibold"
            >
              내역 추가
            </Link>
          </div>
        )}

        {/* 내역 목록 */}
        {entries.length > 0 && (
          <div className="flex flex-col gap-1">
            {entries.map((entry) => {
              const recordedAt = new Date(entry.recordedAt);
              const showDayHeader = prevDay === null || !isSameDay(prevDay, recordedAt);
              prevDay = recordedAt;
              const meta = TYPE_META[entry.entryType as keyof typeof TYPE_META] ?? TYPE_META.BALANCE;
              const deltaStr = formatDelta(entry.deltaKrw, entry.entryType);
              const deltaNum = entry.deltaKrw ? Number(entry.deltaKrw) : null;

              return (
                <div key={entry.id}>
                  {showDayHeader && (
                    <p className="text-[12px] font-semibold text-muted px-1 pt-4 pb-2">
                      {formatDate(recordedAt)}
                    </p>
                  )}
                  <div
                    className="bg-canvas rounded-2xl px-5 py-4"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: meta.color, backgroundColor: meta.bg }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[12px] text-muted">{formatTime(recordedAt)}</span>
                        </div>
                        {entry.note && (
                          <p className="text-[14px] text-ink truncate">{entry.note}</p>
                        )}
                        <p className="text-[12px] text-muted mt-1">{entry.member.displayName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[17px] font-bold text-ink">{krw(entry.amountKrw)}</p>
                        {deltaStr && (
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: deltaNum !== null && deltaNum >= 0 ? "#00a699" : "#fc642d" }}
                          >
                            {deltaStr}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
