import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EntryForm } from "./form";

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const session = await verifySession();
  const { accountId } = await searchParams;

  const allAccounts = await prisma.account.findMany({
    where: { familyId: session.familyId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      currency: true,
      entries: {
        orderBy: [
          { valueDate: { sort: "desc", nulls: "last" } },
          { recordedAt: "desc" },
        ],
        take: 1,
        select: { amountKrw: true },
      },
    },
  });

  const accountBalances: Record<string, number> = Object.fromEntries(
    allAccounts.map((acc) => [
      acc.id,
      acc.entries[0] ? Number(acc.entries[0].amountKrw) : 0,
    ])
  );

  const accounts = allAccounts.map(({ entries: _, ...acc }) => acc);

  const account = accountId
    ? accounts.find((a) => a.id === accountId) ?? null
    : null;

  const currentBalanceKrw = accountId ? (accountBalances[accountId] ?? 0) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-4 h-14 bg-canvas border-b border-hairline">
        <div className="flex items-center gap-0.5">
          {/* 홈 버튼 */}
          <Link
            href="/dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-[8px] text-muted hover:bg-hairline transition-colors"
            aria-label="홈으로"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
          {/* 뒤로가기 버튼 */}
          <Link
            href={account ? `/accounts/${account.id}/history` : "/dashboard"}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] text-muted hover:bg-hairline transition-colors"
            aria-label="뒤로가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
        </div>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-ink">내역 추가</h1>
        <div className="w-[76px]" />
      </header>
      <main className="flex-1 px-5 py-6 max-w-sm mx-auto w-full animate-fade-up">
        <EntryForm
          defaultAccountId={account?.id ?? ""}
          defaultCurrency={account?.currency ?? "KRW"}
          accountName={account?.name ?? null}
          accounts={accounts}
          currentBalanceKrw={currentBalanceKrw}
          accountBalances={accountBalances}
        />
      </main>
    </div>
  );
}
