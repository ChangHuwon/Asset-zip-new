"use client";
import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createEntry } from "@/actions/entries";

const FOREIGN_CURRENCIES = ["USD", "JPY", "EUR", "CNY"];

function EntryForm() {
  const searchParams = useSearchParams();
  const defaultAccountId = searchParams.get("accountId") ?? "";

  const [currency, setCurrency] = useState("KRW");
  const [amount, setAmount] = useState("");
  const [fxRate, setFxRate] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState(createEntry, null);

  useEffect(() => {
    if (currency !== "KRW" && amount && fxRate) {
      const krw = parseFloat(amount) * parseFloat(fxRate);
      if (!isNaN(krw)) {
        setPreview(Math.round(krw).toLocaleString("ko-KR") + "원");
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [currency, amount, fxRate]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="accountId" value={defaultAccountId} />

      <div>
        <label className="block text-sm font-medium text-body-text mb-1.5">
          통화
        </label>
        <select
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink bg-canvas focus:outline-none focus:border-ink focus:border-2"
        >
          <option value="KRW">원화 (KRW)</option>
          {FOREIGN_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-body-text mb-1.5">
          {currency === "KRW" ? "금액 (원)" : `금액 (${currency})`}
        </label>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2"
        />
      </div>

      {currency !== "KRW" && (
        <div>
          <label className="block text-sm font-medium text-body-text mb-1.5">
            환율 (1 {currency} = ? 원)
          </label>
          <input
            name="fxRate"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={fxRate}
            onChange={(e) => setFxRate(e.target.value)}
            placeholder="예: 1350"
            className="w-full h-14 rounded-[8px] border border-hairline px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2"
          />
          {preview && (
            <p className="mt-2 text-sm text-muted">
              → 원화 환산:{" "}
              <span className="font-medium text-ink">{preview}</span>
            </p>
          )}
        </div>
      )}

      {state && !state.success && (
        <p className="text-sm text-primary">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-[8px] bg-primary text-on-primary text-[15px] font-medium disabled:bg-primary-disabled"
      >
        {pending ? "저장 중..." : "잔액 저장"}
      </button>
    </form>
  );
}

export default function NewEntryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-5 h-14 border-b border-hairline">
        <a href="/dashboard" className="text-primary text-sm">
          ← 대시보드
        </a>
        <h1 className="flex-1 text-center text-base font-semibold text-ink">
          잔액 입력
        </h1>
        <div className="w-16" />
      </header>

      <main className="flex-1 px-5 py-6 max-w-sm mx-auto w-full">
        <Suspense fallback={<div className="text-muted text-sm">불러오는 중...</div>}>
          <EntryForm />
        </Suspense>
      </main>
    </div>
  );
}
