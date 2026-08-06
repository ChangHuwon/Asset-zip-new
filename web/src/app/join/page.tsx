"use client";
import { useState, useActionState } from "react";
import { getFamilyByCode, joinFamily } from "@/actions/auth";

type Family = { id: string; name: string } | null;

export default function JoinPage() {
  const [codeInput, setCodeInput] = useState("");
  const [family, setFamily] = useState<Family>(null);
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  const [state, action, pending] = useActionState(joinFamily, null);

  async function handleCodeLookup() {
    if (codeInput.length < 4) return;
    setLooking(true);
    setLookupError("");
    const result = await getFamilyByCode(codeInput);
    setLooking(false);
    if (result) {
      setFamily(result);
    } else {
      setLookupError("유효하지 않은 초대코드입니다.");
    }
  }

  if (!family) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-ink mb-1">초대코드 입력</h1>
          <p className="text-sm text-muted mb-8">
            가족 구성원에게 받은 8자리 코드를 입력하세요.
          </p>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="예: 7F3KQXM9"
            maxLength={8}
            className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted tracking-widest uppercase focus:outline-none focus:border-ink focus:border-2 mb-4"
          />
          {lookupError && (
            <p className="text-sm text-primary mb-3">{lookupError}</p>
          )}
          <button
            onClick={handleCodeLookup}
            disabled={looking || codeInput.length < 4}
            className="w-full h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium disabled:bg-primary-disabled transition-colors"
          >
            {looking ? "확인 중..." : "확인"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-on-primary text-sm font-semibold">
            {codeInput}
          </span>
          <span className="text-muted text-sm">→</span>
          <span className="text-ink font-medium">{family.name}</span>
        </div>

        <h1 className="text-xl font-semibold text-ink mb-1">
          {family.name}에 합류하기
        </h1>
        <p className="text-sm text-muted mb-8">표시 이름과 PIN을 설정하세요.</p>

        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="familyId" value={family.id} />

          <div>
            <label className="block text-sm font-medium text-body-text mb-1.5">
              내 표시 이름
            </label>
            <input
              name="displayName"
              placeholder="예: 엄마"
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
            className="h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium mt-2 disabled:bg-primary-disabled transition-colors"
          >
            {pending ? "합류 중..." : "합류하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
