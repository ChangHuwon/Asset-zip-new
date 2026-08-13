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
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline">
        <Link
          href={account ? `/accounts/${account.id}/history` : "/dashboard"}
          className="text-2xl text-muted leading-none"
        >
          ‹
        </Link>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-ink">내역 추가</h1>
        <div className="w-6" />
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
