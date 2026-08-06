"use client";
import { useState, useActionState } from "react";
import { getMembersForFamily, loginWithPin } from "@/actions/auth";

type Member = { id: string; displayName: string };
type FamilyData = { id: string; name: string; members: Member[] } | null;

export default function LoginPage() {
  const [codeInput, setCodeInput] = useState("");
  const [familyData, setFamilyData] = useState<FamilyData>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  const [state, action, pending] = useActionState(loginWithPin, null);

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

  if (!familyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-ink mb-1">로그인</h1>
          <p className="text-sm text-muted mb-8">초대코드로 그룹을 찾으세요.</p>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="초대코드 8자리"
            maxLength={8}
            className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted tracking-widest uppercase focus:outline-none focus:border-ink focus:border-2 mb-4"
          />
          {lookupError && (
            <p className="text-sm text-primary mb-3">{lookupError}</p>
          )}
          <button
            onClick={handleCodeLookup}
            disabled={looking || codeInput.length < 4}
            className="w-full h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium disabled:bg-primary-disabled"
          >
            {looking ? "확인 중..." : "확인"}
          </button>
        </div>
      </div>
    );
  }

  if (!selectedMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-ink mb-1">
            {familyData.name}
          </h1>
          <p className="text-sm text-muted mb-6">본인을 선택하세요.</p>
          <div className="flex flex-col gap-2">
            {familyData.members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="h-14 rounded-[8px] border border-hairline text-ink text-[15px] font-medium text-left px-4 transition-colors active:bg-surface-soft"
              >
                {m.displayName}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-ink mb-1">
          {selectedMember.displayName}
        </h1>
        <p className="text-sm text-muted mb-8">4자리 PIN을 입력하세요.</p>

        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="memberId" value={selectedMember.id} />
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="• • • •"
            className="w-full h-14 rounded-[8px] border border-hairline px-4 text-center text-2xl tracking-widest text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2"
          />
          {state && !state.success && (
            <p className="text-sm text-primary">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium disabled:bg-primary-disabled"
          >
            {pending ? "확인 중..." : "로그인"}
          </button>
        </form>

        <button
          onClick={() => setSelectedMember(null)}
          className="mt-4 w-full text-sm text-muted"
        >
          다른 사람 선택
        </button>
      </div>
    </div>
  );
}
