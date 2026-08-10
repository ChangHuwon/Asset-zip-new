"use client";
import { useActionState } from "react";
import { createAccount } from "@/actions/accounts";

type Category = { id: string; name: string };

const FOREIGN_CURRENCIES = [
  { code: "USD", label: "미국 달러 (USD)" },
  { code: "JPY", label: "일본 엔 (JPY)" },
  { code: "EUR", label: "유로 (EUR)" },
  { code: "CNY", label: "중국 위안 (CNY)" },
];

export function NewAccountForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createAccount, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label" style={{ marginBottom: 0 }}>카테고리</label>
          <a href="/categories" className="text-xs font-semibold text-primary">관리</a>
        </div>
        <select name="categoryId" className="field-input" defaultValue="">
          <option value="" disabled>선택...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">계좌 이름</label>
        <input name="name" placeholder="예: OO은행 공동통장" className="field-input" />
      </div>

      <div>
        <label className="field-label">통화</label>
        <select name="currency" defaultValue="KRW" className="field-input">
          <option value="KRW">원화 (KRW)</option>
          {FOREIGN_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {state && !state.success && <p className="error-box">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "저장 중..." : "계좌 추가"}
      </button>
    </form>
  );
}
