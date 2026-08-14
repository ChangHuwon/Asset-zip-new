"use client";
import { useActionState } from "react";
import { createFamily } from "@/actions/auth";
import Link from "next/link";

export default function CreatePage() {
  const [state, action, pending] = useActionState(createFamily, null);

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <header className="flex items-center px-5 h-14">
        <Link href="/start" className="w-10 h-10 flex items-center justify-center rounded-[8px] text-[22px] text-muted hover:bg-hairline transition-colors">‹</Link>
      </header>

      <main className="flex-1 px-6 pt-2 pb-10 max-w-sm mx-auto w-full animate-fade-up">
        <h1 className="text-[26px] font-bold text-ink tracking-tight mb-1">가족 그룹 만들기</h1>
        <p className="text-[15px] text-muted mb-8">그룹이 생성되면 초대코드가 발급됩니다.</p>

        <form action={action} className="flex flex-col gap-5">
          <div>
            <label className="field-label">가족 그룹 이름</label>
            <input name="familyName" placeholder="예: 우리집" className="field-input" />
          </div>
          <div>
            <label className="field-label">내 표시 이름</label>
            <input name="displayName" placeholder="예: 아빠" className="field-input" />
          </div>
          <div>
            <label className="field-label">6자리 PIN (로그인에 사용)</label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              className="field-input text-center tracking-[0.5em] text-xl"
            />
            <p className="text-[12px] text-muted mt-1.5">전체에서 중복되지 않는 PIN을 설정하세요.</p>
          </div>

          {state && !state.success && <p className="error-box">{state.error}</p>}

          <button type="submit" disabled={pending} className="btn-primary mt-2">
            {pending ? "생성 중..." : "그룹 만들기"}
          </button>
        </form>
      </main>
    </div>
  );
}
