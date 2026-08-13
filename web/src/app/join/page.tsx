"use client";
import { useState, useActionState } from "react";
import { getFamilyByCode, joinFamily } from "@/actions/auth";
import Link from "next/link";

type Family = { id: string; name: string } | null;

export default function JoinPage() {
  const [codeInput, setCodeInput] = useState("");
  const [family, setFamily] = useState<Family>(null);
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  const [state, action, pending] = useActionState(joinFamily, null);

  async function handleCodeLookup() {
    if (codeInput.length < 8) return;
    setLooking(true);
    setLookupError("");
    try {
      const result = await getFamilyByCode(codeInput);
      if (result) {
        setFamily(result);
      } else {
        setLookupError("유효하지 않은 초대코드입니다.");
      }
    } catch {
      setLookupError("서버 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLooking(false);
    }
  }

  if (!family) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas">
        <header className="flex items-center px-5 h-14">
          <Link href="/start" className="text-2xl text-muted leading-none">‹</Link>
        </header>
        <main className="flex-1 px-6 pt-2 pb-10 max-w-sm mx-auto w-full animate-fade-up">
          <h1 className="text-[26px] font-bold text-ink tracking-tight mb-1">초대코드 입력</h1>
          <p className="text-[15px] text-muted mb-8">가족 구성원에게 받은 8자리 코드를 입력하세요.</p>

          <label className="field-label">초대코드</label>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="예: 7F3KQXM9"
            maxLength={8}
            className="field-input tracking-[0.3em] uppercase text-center mb-3"
          />
          {lookupError && <p className="error-box mb-4">{lookupError}</p>}
          <button
            onClick={handleCodeLookup}
            disabled={looking || codeInput.length < 8}
            className="btn-primary mt-1"
          >
            {looking ? "확인 중..." : "확인"}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <header className="flex items-center px-5 h-14">
        <button onClick={() => setFamily(null)} className="text-2xl text-muted leading-none">‹</button>
      </header>
      <main className="flex-1 px-6 pt-2 pb-10 max-w-sm mx-auto w-full animate-scale-in">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-surface-soft">
          <span className="text-xs font-bold text-primary tracking-widest">{codeInput}</span>
          <span className="text-xs text-muted">→</span>
          <span className="text-xs font-semibold text-ink">{family.name}</span>
        </div>

        <h1 className="text-[26px] font-bold text-ink tracking-tight mb-1">{family.name}에 합류하기</h1>
        <p className="text-[15px] text-muted mb-8">표시 이름과 PIN을 설정하세요.</p>

        <form action={action} className="flex flex-col gap-5">
          <input type="hidden" name="familyId" value={family.id} />
          <div>
            <label className="field-label">내 표시 이름</label>
            <input name="displayName" placeholder="예: 엄마" className="field-input" />
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
            {pending ? "합류 중..." : "합류하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
