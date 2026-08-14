"use client";
import { useActionState, useState } from "react";
import { changePin } from "@/actions/auth";
import Link from "next/link";

function PinInput({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-7">
      <p className="text-[13px] font-semibold text-muted mb-3 px-1">{label}</p>
      <div
        className="relative flex justify-center rounded-2xl bg-canvas"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex gap-5 py-5 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-[13px] h-[13px] rounded-full transition-all duration-150 ${
                i < value.length ? "bg-ink scale-110" : "border-2 border-hairline"
              }`}
            />
          ))}
        </div>
        <input
          name={name}
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ fontSize: "16px" }}
        />
      </div>
    </div>
  );
}

export function ChangePinForm() {
  const [current, setCurrent] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, action, pending] = useActionState(changePin, null);

  const allFilled = current.length === 6 && newPin.length === 6 && confirm.length === 6;

  if (state?.success) {
    return (
      <div className="text-center py-10 animate-fade-up">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e6f7f6] mb-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00a699" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-[18px] font-bold text-ink mb-2">PIN 변경 완료</p>
        <p className="text-[14px] text-muted mb-8">다음 로그인부터 새 PIN을 사용하세요.</p>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center px-6 rounded-[10px] bg-primary text-on-primary text-[14px] font-semibold"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col">
      <PinInput name="currentPin" label="현재 PIN No." value={current} onChange={setCurrent} />
      <PinInput name="newPin" label="변경 PIN No." value={newPin} onChange={setNewPin} />
      <PinInput name="confirmPin" label="변경 PIN No. 재입력" value={confirm} onChange={setConfirm} />

      {state && !state.success && (
        <p className="text-[13px] text-[#fc642d] text-center mb-4 bg-[#fff3ef] rounded-[10px] px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !allFilled}
        className="btn-primary mt-1"
      >
        {pending ? "변경 중..." : "PIN 변경하기"}
      </button>
    </form>
  );
}
