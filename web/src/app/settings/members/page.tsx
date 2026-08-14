import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { MemberList } from "./member-list";

export default async function MembersPage() {
  const session = await verifySession();
  if (!session.isOwner) redirect("/dashboard");

  const members = await prisma.member.findMany({
    where: { familyId: session.familyId },
    orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
    select: { id: true, displayName: true, isOwner: true },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-[8px] text-[22px] text-muted hover:bg-hairline transition-colors">‹</Link>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold text-ink">계정관리</p>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full animate-fade-up">
        <MemberList members={members} currentMemberId={session.memberId} />
      </main>
    </div>
  );
}
