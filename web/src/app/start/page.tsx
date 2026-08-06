import Link from "next/link";

export default function StartPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Asset.ZIP
          </h1>
          <p className="mt-2 text-sm text-muted">우리 가족 공동자산 장부</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/create"
            className="flex h-12 items-center justify-center rounded-[8px] bg-primary text-on-primary text-[15px] font-medium transition-colors active:bg-primary-active"
          >
            가족 그룹 만들기
          </Link>
          <Link
            href="/join"
            className="flex h-12 items-center justify-center rounded-[8px] border border-hairline text-ink text-[15px] font-medium transition-colors active:bg-surface-soft"
          >
            초대코드로 합류하기
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          이미 가입된 기기라면{" "}
          <Link href="/login" className="text-primary underline-offset-2 underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
