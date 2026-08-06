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
      <header className="flex items-center px-5 h-14 border-b border-hairline">
        <a href="/dashboard" className="text-primary text-sm">
          ← 대시보드
        </a>
        <h1 className="flex-1 text-center text-base font-semibold text-ink">
          계좌 추가
        </h1>
        <div className="w-16" />
      </header>
      <main className="flex-1 px-5 py-6 max-w-sm mx-auto w-full">
        <NewAccountForm categories={categories} />
      </main>
    </div>
  );
}
