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

  const [account, accounts] = await Promise.all([
    accountId
      ? prisma.account.findUnique({
          where: { id: accountId, familyId: session.familyId },
          select: { id: true, name: true, currency: true },
        })
      : null,
    prisma.account.findMany({
      where: { familyId: session.familyId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, currency: true },
    }),
  ]);

  const latestEntry = accountId
    ? await prisma.entry.findFirst({
        where: { accountId },
        orderBy: { recordedAt: "desc" },
        select: { amountKrw: true },
      })
    : null;

  const currentBalanceKrw = latestEntry ? Number(latestEntry.amountKrw) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline">
        <a
          href={account ? `/accounts/${account.id}/history` : "/dashboard"}
          className="text-2xl text-muted leading-none"
        >
          ‹
        </a>
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
        />
      </main>
    </div>
  );
}
