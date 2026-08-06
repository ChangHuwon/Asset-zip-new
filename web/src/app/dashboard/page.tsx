import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { logout } from "@/actions/auth";

type CategorySummary = {
  id: string;
  name: string;
  total: bigint;
  accounts: {
    id: string;
    name: string;
    latestEntry: {
      amountKrw: bigint;
      memberName: string;
      recordedAt: Date;
    } | null;
  }[];
};

async function getDashboardData(familyId: string) {
  const categories = await prisma.assetCategory.findMany({
    where: { familyId },
    orderBy: { sortOrder: "asc" },
    include: {
      accounts: {
        where: { familyId },
        include: {
          entries: {
            orderBy: { recordedAt: "desc" },
            take: 1,
            include: { member: { select: { displayName: true } } },
          },
        },
      },
    },
  });

  const summaries: CategorySummary[] = categories.map((cat) => {
    const accounts: CategorySummary["accounts"] = cat.accounts.map((acc) => {
      const latest = acc.entries[0] ?? null;
      return {
        id: acc.id,
        name: acc.name,
        latestEntry: latest
          ? {
              amountKrw: latest.amountKrw,
              memberName: latest.member.displayName,
              recordedAt: latest.recordedAt,
            }
          : null,
      };
    });
    const total = accounts.reduce(
      (sum: bigint, a) => sum + (a.latestEntry?.amountKrw ?? BigInt(0)),
      BigInt(0)
    );
    return { id: cat.id, name: cat.name, total, accounts };
  });

  const grandTotal = summaries.reduce(
    (s: bigint, c) => s + c.total,
    BigInt(0)
  );
  return { summaries, grandTotal };
}

function formatKrw(amount: bigint): string {
  return Number(amount).toLocaleString("ko-KR") + "원";
}

function formatPercent(part: bigint, total: bigint): string {
  if (total === BigInt(0)) return "0%";
  return ((Number(part) / Number(total)) * 100).toFixed(1) + "%";
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "1일 전";
  return `${diffDays}일 전`;
}

export default async function DashboardPage() {
  const session = await verifySession();
  const { summaries, grandTotal } = await getDashboardData(session.familyId);
  const family = await prisma.family.findUnique({
    where: { id: session.familyId },
    select: { name: true, inviteCode: true },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-hairline bg-canvas">
        <span className="text-base font-semibold text-ink">Asset.ZIP</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{session.displayName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-muted underline-offset-2 underline"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        {/* Total card */}
        <div
          className="rounded-[14px] border border-hairline p-6 mb-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-sm text-muted mb-1">{family?.name} 공동자산 총액</p>
          <p className="text-[44px] font-bold text-ink leading-none tracking-tight">
            {formatKrw(grandTotal)}
          </p>
          <p className="text-xs text-muted mt-2">
            초대코드:{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-on-primary text-xs font-semibold">
              {family?.inviteCode}
            </span>
          </p>
        </div>

        {/* Category cards */}
        <div className="flex flex-col gap-4">
          {summaries.map((cat) => (
            <div
              key={cat.id}
              className="rounded-[14px] border border-hairline p-5"
            >
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[15px] font-medium text-ink">
                  {cat.name}
                </span>
                <div className="text-right">
                  <span className="text-[15px] font-medium text-ink">
                    {formatKrw(cat.total)}
                  </span>
                  {grandTotal > BigInt(0) && (
                    <span className="ml-2 text-sm text-muted">
                      {formatPercent(cat.total, grandTotal)}
                    </span>
                  )}
                </div>
              </div>

              {cat.accounts.length === 0 ? (
                <p className="text-sm text-muted">계좌 없음</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {cat.accounts.map((acc) => (
                    <li
                      key={acc.id}
                      className="flex items-center justify-between py-2 border-t border-hairline first:border-t-0"
                    >
                      <div>
                        <p className="text-sm text-body-text">{acc.name}</p>
                        {acc.latestEntry ? (
                          <p className="text-xs text-muted mt-0.5">
                            {acc.latestEntry.memberName} ·{" "}
                            {timeAgo(acc.latestEntry.recordedAt)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted mt-0.5">미입력</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {acc.latestEntry ? (
                          <span className="text-sm font-medium text-ink">
                            {formatKrw(acc.latestEntry.amountKrw)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted">—</span>
                        )}
                        <Link
                          href={`/entries/new?accountId=${acc.id}`}
                          className="text-xs text-primary font-medium"
                        >
                          입력
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6">
          <Link
            href="/accounts/new"
            className="flex h-12 items-center justify-center rounded-[8px] border border-hairline text-ink text-[15px] font-medium transition-colors active:bg-surface-soft"
          >
            + 계좌 추가
          </Link>
        </div>
      </main>
    </div>
  );
}
