import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { ChangePinForm } from "./form";

export default async function ChangePinPage() {
  const session = await verifySession();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 bg-canvas border-b border-hairline sticky top-0 z-10">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-[8px] text-[22px] text-muted hover:bg-hairline transition-colors">‹</Link>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold text-ink">PIN 변경</p>
          <p className="text-[11px] text-muted">{session.displayName}</p>
        </div>
        <div className="w-6" />
      </header>

      <main className="flex-1 px-5 py-8 max-w-sm mx-auto w-full animate-fade-up">
        <ChangePinForm />
      </main>
    </div>
  );
}
