"use client";
import { useState, useRef, useActionState } from "react";
import { getMembersForFamily, loginWithPin } from "@/actions/auth";
import Link from "next/link";

type Member = { id: string; displayName: string };
type FamilyData = { id: string; name: string; members: Member[] } | null;

export default function LoginPage() {
  const [codeInput, setCodeInput] = useState("");
  const [familyData, setFamilyData] = useState<FamilyData>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  const [pin, setPin] = useState("");
  const [state, action, pending] = useActionState(loginWithPin, null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  async function handleCodeLookup() {
    if (codeInput.length < 4) return;
    setLooking(true);
    setLookupError("");
    const result = await getMembersForFamily(codeInput);
    setLooking(false);
    if (result) {
      setFamilyData(result);
    } else {
      setLookupError("유효하지 않은 초대코드입니다.");
    }
  }

  /* ── Step 1: 초대코드 ── */
  if (!familyData) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas">
        <header className="flex items-center px-5 h-14">
          <Link href="/start" className="text-2xl text-muted leading-none">‹</Link>
        </header>
        <main className="flex-1 px-6 pt-2 pb-10 max-w-sm mx-auto w-full animate-fade-up">
          <h1 className="text-[26px] font-bold text-ink tracking-tight mb-1">로그인</h1>
          <p className="text-[15px] text-muted mb-8">초대코드로 그룹을 찾으세요.</p>

          <label className="field-label">초대코드</label>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="8자리 코드"
            maxLength={8}
            className="field-input tracking-[0.3em] uppercase text-center mb-3"
          />
          {lookupError && <p className="error-box mb-4">{lookupError}</p>}
          <button
            onClick={handleCodeLookup}
            disabled={looking || codeInput.length < 4}
            className="btn-primary mt-1"
          >
            {looking ? "확인 중..." : "확인"}
          </button>
        </main>
      </div>
    );
  }

  /* ── Step 2: 멤버 선택 ── */
  if (!selectedMember) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas">
        <header className="flex items-center px-5 h-14">
          <button onClick={() => setFamilyData(null)} className="text-2xl text-muted leading-none">‹</button>
        </header>
        <main className="flex-1 px-6 pt-2 pb-10 max-w-sm mx-auto w-full animate-scale-in">
          <h1 className="text-[26px] font-bold text-ink tracking-tight mb-1">{familyData.name}</h1>
          <p className="text-[15px] text-muted mb-8">본인을 선택하세요.</p>
          <div className="flex flex-col gap-2">
            {familyData.members.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelectedMember(m); setPin(""); }}
                className="h-14 rounded-[10px] border-[1.5px] border-hairline bg-canvas text-ink text-[15px] font-semibold text-left px-5 transition-colors active:bg-surface-soft"
              >
                {m.displayName}
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  /* ── Step 3: PIN 입력 ── */
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <header className="flex items-center px-5 h-14">
        <button onClick={() => setSelectedMember(null)} className="text-2xl text-muted leading-none">‹</button>
      </header>
      <main className="flex-1 flex flex-col px-6 pb-10 max-w-sm mx-auto w-full animate-scale-in">
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-[15px] text-muted mb-1">안녕하세요,</p>
          <h1 className="text-[26px] font-bold text-ink tracking-tight mb-10">
            {selectedMember.displayName}
          </h1>

          {/* PIN 도트 + 투명 input overlay */}
          <div className="relative flex justify-center w-full mb-10">
            <div className="flex gap-6 py-5 pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-[14px] h-[14px] rounded-full transition-all duration-150 ${
                    i < pin.length ? "bg-ink scale-110" : "border-2 border-hairline"
                  }`}
                />
              ))}
            </div>
            {/* 투명 input이 도트 영역 전체를 덮어서 탭하면 키보드가 올라옴 */}
            <form action={action} id="pin-form" className="absolute inset-0">
              <input type="hidden" name="memberId" value={selectedMember.id} />
              <input
                ref={pinInputRef}
                name="pin"
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                autoFocus
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ fontSize: "16px" }}
              />
            </form>
          </div>

          {state && !state.success && (
            <p className="error-box w-full text-center mb-6">{state.error}</p>
          )}
        </div>

        <button
          type="submit"
          form="pin-form"
          disabled={pending || pin.length < 4}
          className="btn-primary"
        >
          {pending ? "확인 중..." : "로그인"}
        </button>
      </main>
    </div>
  );
}
