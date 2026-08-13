"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginWithPin } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [state, action, pending] = useActionState(loginWithPin, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (pin.length === 6 && !pending) {
      formRef.current?.requestSubmit();
    }
  }, [pin, pending]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <header className="flex items-center px-5 h-14">
        <Link href="/start" className="text-2xl text-muted leading-none">‹</Link>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-10 max-w-sm mx-auto w-full">
        <div className="flex-1 flex flex-col items-center justify-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-6">
            <span className="text-on-primary text-xl font-bold tracking-tighter">A.Z</span>
          </div>
          <p className="text-[15px] text-muted mb-1">6자리 PIN으로 로그인</p>

          {/* PIN 도트 */}
          <div className="relative flex justify-center w-full mt-8 mb-4">
            <div className="flex gap-4 py-5 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[14px] h-[14px] rounded-full transition-all duration-150 ${
                    i < pin.length ? "bg-ink scale-110" : "border-2 border-hairline"
                  }`}
                />
              ))}
            </div>
            <form action={action} id="pin-form" ref={formRef} className="absolute inset-0">
              <input
                name="pin"
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ fontSize: "16px" }}
              />
            </form>
          </div>

          {state && !state.success && (
            <p className="error-box w-full text-center mt-2">{state.error}</p>
          )}
        </div>

        <button
          type="submit"
          form="pin-form"
          disabled={pending || pin.length < 6}
          className="btn-primary mb-4"
        >
          {pending ? "확인 중..." : "로그인"}
        </button>

        <p className="text-center text-[13px] text-muted">
          처음이라면{" "}
          <Link href="/create" className="text-primary font-semibold">가족 그룹 만들기</Link>
          {" "}·{" "}
          <Link href="/join" className="text-primary font-semibold">초대코드로 합류</Link>
        </p>
      </main>
    </div>
  );
}
