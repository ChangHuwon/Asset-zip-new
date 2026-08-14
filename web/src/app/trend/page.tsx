import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TrendChart } from "./trend-chart";
import { CategoryPie } from "./category-pie";

type Period = "7d" | "1m" | "3m" | "6m" | "1y";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "7일" },
  { value: "1m", label: "1개월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "1y", label: "1년" },
];

const SLICE_COLORS = ["#ff385c", "#00a699", "#fc642d", "#767676", "#222222"];

function getPeriodDays(period: Period): number {
  switch (period) {
    case "7d": return 7;
    case "1m": return 30;
    case "3m": return 90;
    case "6m": return 180;
    case "1y": return 365;
  }
}

function getStepDays(days: number): number {
  if (days <= 30) return 1;
  if (days <= 90) return 3;
  if (days <= 180) return 7;
  return 14;
}

export type DailySnapshot = {
  date: string;
  totalKrw: number;
};

export type CategorySlice = {
  name: string;
  value: number;
  color: string;
};

async function computeSnapshots(
  familyId: string,
  fromDate: Date,
  toDate: Date,
  stepDays: number,
): Promise<DailySnapshot[]> {
  const accounts = await prisma.account.findMany({
    where: { familyId },
    select: { id: true },
  });
  if (accounts.length === 0) return [];

  const entries = await prisma.entry.findMany({
    where: { accountId: { in: accounts.map((a) => a.id) } },
    select: {
      accountId: true,
      amountKrw: true,
      valueDate: true,
      recordedAt: true,
    },
  });

  entries.sort((a, b) => {
    const da = (a.valueDate ?? a.recordedAt).getTime();
    const db = (b.valueDate ?? b.recordedAt).getTime();
    return da !== db ? da - db : a.recordedAt.getTime() - b.recordedAt.getTime();
  });

  const accountBalances = new Map<string, bigint>();
  let ei = 0;
  const snapshots: DailySnapshot[] = [];

  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + stepDays)) {
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    while (ei < entries.length) {
      const entry = entries[ei];
      const effectiveDate = entry.valueDate ?? entry.recordedAt;
      if (effectiveDate <= dayEnd) {
        accountBalances.set(entry.accountId, entry.amountKrw);
        ei++;
      } else break;
    }

    const total = [...accountBalances.values()].reduce((s, v) => s + v, BigInt(0));
    snapshots.push({
      date: new Date(d).toISOString().split("T")[0],
      totalKrw: Number(total),
    });
  }

  return snapshots;
}

async function getCategoryDistribution(familyId: string): Promise<CategorySlice[]> {
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
            select: { amountKrw: true },
          },
        },
      },
    },
  });

  return categories
    .map((cat, i) => ({
      name: cat.name,
      value: cat.accounts.reduce(
        (sum, acc) => sum + (acc.entries[0] ? Number(acc.entries[0].amountKrw) : 0),
        0,
      ),
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }))
    .filter((c) => c.value > 0);
}

function krw(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default async function TrendPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await verifySession();
  const { period: rawPeriod } = await searchParams;
  const period = (["7d", "1m", "3m", "6m", "1y"].includes(rawPeriod ?? "")
    ? rawPeriod
    : "1m") as Period;

  const days = getPeriodDays(period);
  const stepDays = getStepDays(days);

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  fromDate.setHours(0, 0, 0, 0);

  const [snapshots, categorySlices] = await Promise.all([
    computeSnapshots(session.familyId, fromDate, toDate, stepDays),
    getCategoryDistribution(session.familyId),
  ]);

  const nonZero = snapshots.filter((s) => s.totalKrw > 0);
  const first = nonZero[0]?.totalKrw ?? 0;
  const last = snapshots[snapshots.length - 1]?.totalKrw ?? 0;
  const delta = last - first;
  const deltaPct = first > 0 ? ((delta / first) * 100).toFixed(1) : null;
  const grandTotal = categorySlices.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <Link href="/dashboard" className="text-2xl text-muted leading-none">‹</Link>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold text-ink">Analysis</p>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full animate-fade-up">

        {/* ── 금액 추이 섹션 ── */}
        <p className="text-[13px] font-semibold text-muted uppercase tracking-wide px-1 mb-3">
          금액 추이
        </p>

        {/* 기간 선택 탭 */}
        <div className="flex gap-1.5 mb-4">
          {PERIOD_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/trend?period=${opt.value}`}
              className={`flex-1 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-colors ${
                period === opt.value
                  ? "bg-primary text-on-primary"
                  : "bg-canvas border border-hairline text-muted"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* 요약 카드 */}
        <div
          className="rounded-2xl mb-4 px-6 py-5"
          style={{
            background: "linear-gradient(150deg, #1e1e2e 0%, #2d2d50 100%)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="text-[13px] font-semibold uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            현재 총액
          </p>
          <p className="text-[36px] font-bold tracking-tight leading-none text-white">
            {krw(last)}
          </p>
          {delta !== 0 && (
            <p
              className="text-[14px] font-semibold mt-2"
              style={{ color: delta >= 0 ? "#4ecdc4" : "#fc8a6a" }}
            >
              {delta >= 0 ? "▲" : "▼"} {krw(Math.abs(delta))}
              {deltaPct && ` (${delta >= 0 ? "+" : "-"}${Math.abs(Number(deltaPct))}%)`}
            </p>
          )}
          {delta === 0 && nonZero.length > 0 && (
            <p className="text-[13px] mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              기간 중 변동 없음
            </p>
          )}
        </div>

        {/* 추이 차트 */}
        <TrendChart data={snapshots} />

        {/* ── 자산 구성 섹션 ── */}
        <p className="text-[13px] font-semibold text-muted uppercase tracking-wide px-1 mt-6 mb-3">
          자산 구성
        </p>

        <CategoryPie data={categorySlices} total={grandTotal} />

      </main>
    </div>
  );
}
