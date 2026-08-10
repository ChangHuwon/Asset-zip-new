import Link from "next/link";

export default function StartPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Brand area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8">
        <div className="animate-fade-up text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
            <span className="text-on-primary text-2xl font-bold tracking-tighter">A.Z</span>
          </div>
          <h1 className="text-[28px] font-bold text-ink tracking-tight leading-tight">
            Asset.ZIP
          </h1>
          <p className="mt-2 text-[15px] text-muted leading-relaxed">
            우리 가족 공동자산 장부
          </p>
        </div>
      </div>

      {/* CTA area */}
      <div className="px-6 pb-10 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <Link
          href="/create"
          className="flex h-14 items-center justify-center rounded-xl bg-primary text-on-primary text-[15px] font-semibold transition-colors active:bg-primary-active"
        >
          가족 그룹 만들기
        </Link>
        <Link
          href="/join"
          className="flex h-14 items-center justify-center rounded-xl border-2 border-hairline text-ink text-[15px] font-semibold transition-colors active:bg-surface-soft"
        >
          초대코드로 합류하기
        </Link>

        <p className="text-center text-sm text-muted mt-2">
          이미 가입됐다면{" "}
          <Link href="/login" className="text-primary font-medium underline underline-offset-2">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
