import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NewAccountForm } from "./form";

export default async function NewAccountPage() {
  const session = await verifySession();
  const categories = await prisma.assetCategory.findMany({
    where: { familyId: session.familyId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline">
        <a href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-[8px] text-[22px] text-muted hover:bg-hairline transition-colors">‹</a>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-ink">계좌 추가</h1>
        <div className="w-6" />
      </header>
      <main className="flex-1 px-5 py-6 max-w-sm mx-auto w-full animate-fade-up">
        <NewAccountForm categories={categories} />
      </main>
    </div>
  );
}
