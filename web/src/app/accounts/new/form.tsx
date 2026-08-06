"use client";
import { useActionState, useState } from "react";
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
        <label className="block text-sm font-medium text-body-text mb-1.5">
          카테고리
        </label>
        <select
          name="categoryId"
          className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink bg-canvas focus:outline-none focus:border-ink focus:border-2"
          defaultValue=""
        >
          <option value="" disabled>
            선택...
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-body-text mb-1.5">
          계좌 이름
        </label>
        <input
          name="name"
          placeholder="예: OO은행 공동통장"
          className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-body-text mb-1.5">
          통화
        </label>
        <select
          name="currency"
          defaultValue="KRW"
          className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink bg-canvas focus:outline-none focus:border-ink focus:border-2"
        >
          <option value="KRW">원화 (KRW)</option>
          {FOREIGN_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {state && !state.success && (
        <p className="text-sm text-primary">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium disabled:bg-primary-disabled transition-colors"
      >
        {pending ? "저장 중..." : "계좌 추가"}
      </button>
    </form>
  );
}
