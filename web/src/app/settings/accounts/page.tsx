import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AccountList } from "./account-list";

export default async function AccountManagePage() {
  const session = await verifySession();
  if (!session.isOwner) redirect("/dashboard");

  const categories = await prisma.assetCategory.findMany({
    where: { familyId: session.familyId },
    orderBy: { sortOrder: "asc" },
    include: {
      accounts: {
        where: { familyId: session.familyId },
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { entries: true } } },
      },
    },
  });

  const groups = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    accounts: cat.accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      currency: acc.currency,
      note: acc.note,
      categoryId: acc.categoryId,
      entryCount: acc._count.entries,
    })),
  }));

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-[8px] text-[22px] text-muted hover:bg-hairline transition-colors">‹</Link>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold text-ink">계좌 관리</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full animate-fade-up">
        <AccountList groups={groups} categories={categoryOptions} />
      </main>
    </div>
  );
}
