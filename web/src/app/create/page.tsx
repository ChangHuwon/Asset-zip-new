"use client";
import { useActionState } from "react";
import { createFamily } from "@/actions/auth";

export default function CreatePage() {
  const [state, action, pending] = useActionState(createFamily, null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-ink mb-1">가족 그룹 만들기</h1>
        <p className="text-sm text-muted mb-8">
          그룹이 생성되면 초대코드가 발급됩니다.
        </p>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-body-text mb-1.5">
              가족 그룹 이름
            </label>
            <input
              name="familyName"
              placeholder="예: 우리집"
              className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-body-text mb-1.5">
              내 표시 이름
            </label>
            <input
              name="displayName"
              placeholder="예: 아빠"
              className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-body-text mb-1.5">
              4자리 PIN
            </label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="숫자 4자리"
              className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted tracking-widest focus:outline-none focus:border-ink focus:border-2"
            />
          </div>

          {state && !state.success && (
            <p className="text-sm text-primary">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium mt-2 disabled:bg-primary-disabled transition-colors active:bg-primary-active"
          >
            {pending ? "생성 중..." : "그룹 만들기"}
          </button>
        </form>
      </div>
    </div>
  );
}
