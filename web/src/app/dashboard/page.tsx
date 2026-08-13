import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { logout } from "@/actions/auth";
import { CopyCode } from "./copy-code";

const SEGMENT_COLORS = ["#ff385c", "#00a699", "#fc642d", "#767676", "#222222"];

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
            orderBy: [
              { valueDate: { sort: "desc", nulls: "last" } },
              { recordedAt: "desc" },
            ],
            take: 1,
            include: { member: { select: { displayName: true } } },
          },
        },
      },
    },
  });

  const summaries: CategorySummary[] = categories.map((cat) => {
    const accounts = cat.accounts.map((acc) => {
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

  const grandTotal = summaries.reduce((s: bigint, c) => s + c.total, BigInt(0));
  return { summaries, grandTotal };
}

function krw(amount: bigint) {
  return Number(amount).toLocaleString("ko-KR") + "원";
}

function pct(part: bigint, total: bigint) {
  if (total === BigInt(0)) return "0%";
  return ((Number(part) / Number(total)) * 100).toFixed(1) + "%";
}

function timeAgo(date: Date) {
  const d = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (d === 0) return "오늘";
  if (d === 1) return "1일 전";
  if (d <= 6) return `${d}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await verifySession();
  const { summaries, grandTotal } = await getDashboardData(session.familyId);
  const family = await prisma.family.findUnique({
    where: { id: session.familyId },
    select: { name: true, inviteCode: true },
  });

  const hasAccounts = summaries.some((s) => s.accounts.length > 0);
  const activeCategories = summaries.filter((s) => s.total > BigInt(0));

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <span className="text-[17px] font-bold text-ink tracking-tight">Asset.ZIP</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{session.displayName}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-muted">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full animate-fade-up">

        {/* 총액 카드 */}
        <div className="bg-canvas rounded-2xl mb-4 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="h-1 bg-primary" />
          <div className="px-6 pt-5 pb-6">
            <p className="text-[13px] font-semibold text-muted uppercase tracking-wide mb-1">
              {family?.name} 공동자산
            </p>
            <p className="text-[48px] font-bold text-ink tracking-tight leading-none">
              {krw(grandTotal)}
            </p>

            {/* 비중 바 */}
            {grandTotal > BigInt(0) && activeCategories.length > 0 && (
              <div className="mt-4 flex h-[6px] rounded-full overflow-hidden gap-0.5">
                {activeCategories.map((cat, i) => (
                  <div
                    key={cat.id}
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: pct(cat.total, grandTotal),
                      backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    }}
                    title={`${cat.name}: ${pct(cat.total, grandTotal)}`}
                  />
                ))}
              </div>
            )}

            {session.isOwner && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted">초대코드</span>
                <CopyCode code={family?.inviteCode ?? ""} />
              </div>
            )}
          </div>
        </div>

        {/* 빈 상태 */}
        {!hasAccounts && (
          <div className="bg-canvas rounded-2xl p-8 text-center mb-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="text-4xl mb-3">💰</div>
            <p className="text-[17px] font-semibold text-ink mb-1">첫 계좌를 추가해보세요</p>
            <p className="text-[14px] text-muted mb-5">
              계좌를 등록하고 잔액을 입력하면<br />총액이 자동으로 집계됩니다.
            </p>
            <Link
              href="/accounts/new"
              className="inline-flex h-11 items-center px-6 rounded-[10px] bg-primary text-on-primary text-[14px] font-semibold"
            >
              계좌 추가하기
            </Link>
          </div>
        )}

        {/* 카테고리 카드 */}
        <div className="flex flex-col gap-3">
          {summaries.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-canvas rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* 카테고리 헤더 */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length] }}
                  />
                  <span className="text-[15px] font-semibold text-ink">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-bold text-ink">{krw(cat.total)}</span>
                  {grandTotal > BigInt(0) && cat.total > BigInt(0) && (
                    <span className="ml-2 text-xs text-muted">{pct(cat.total, grandTotal)}</span>
                  )}
                </div>
              </div>

              {/* 계좌 목록 */}
              <div className="px-5">
                {cat.accounts.length === 0 ? (
                  <div className="py-4 text-[13px] text-muted">계좌 없음</div>
                ) : (
                  <ul>
                    {cat.accounts.map((acc) => (
                      <li
                        key={acc.id}
                        className="flex items-center justify-between py-3.5 border-b border-hairline last:border-0"
                      >
                        <div className="min-w-0 flex-1 mr-3">
                          <Link href={`/accounts/${acc.id}/history`} className="text-[14px] font-medium text-ink truncate hover:underline">
                            {acc.name}
                          </Link>
                          <p className="text-[12px] text-muted mt-0.5">
                            {acc.latestEntry
                              ? `${acc.latestEntry.memberName} · ${timeAgo(acc.latestEntry.recordedAt)}`
                              : "잔액 미입력"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[15px] font-bold ${acc.latestEntry ? "text-ink" : "text-muted"}`}>
                            {acc.latestEntry ? krw(acc.latestEntry.amountKrw) : "—"}
                          </span>
                          <Link
                            href={`/entries/new?accountId=${acc.id}`}
                            className="text-[13px] font-semibold text-primary bg-[#fff1f3] px-3 py-1.5 rounded-full"
                          >
                            입력
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-4 flex flex-col gap-2">
          {hasAccounts && (
            <Link
              href="/accounts/new"
              className="flex h-12 items-center justify-center rounded-[10px] bg-canvas border-[1.5px] border-hairline text-ink text-[15px] font-semibold"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              + 계좌 추가
            </Link>
          )}
          {session.isOwner && (
            <Link
              href="/categories"
              className="flex h-12 items-center justify-center rounded-[10px] bg-canvas border-[1.5px] border-hairline text-muted text-[14px] font-medium"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              카테고리 관리
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
