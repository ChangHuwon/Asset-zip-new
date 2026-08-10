"use client";
import { useActionState, useState } from "react";
import { updateEntry } from "@/actions/entries";

const TYPE_LABEL: Record<string, string> = {
  BALANCE: "잔액 입력",
  DEPOSIT: "입금",
  WITHDRAWAL: "출금",
  INVEST_RETURN: "투자 수익",
};

function formatComma(value: string): string {
  const raw = value.replace(/,/g, "");
  if (!/^-?\d*\.?\d*$/.test(raw)) return value;
  const isNeg = raw.startsWith("-");
  const abs = raw.replace("-", "");
  const [integer, decimal] = abs.split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const result = decimal !== undefined ? formatted + "." + decimal : formatted;
  return isNeg ? "-" + result : result;
}

export type EntryForEdit = {
  id: string;
  accountId: string;
  accountName: string;
  entryType: string;
  initialAmount: string;
  initialFxRate: string;
  currency: string;
  note: string;
  valueDate: string;
};

export function EditEntryForm({ entry }: { entry: EntryForEdit }) {
  const [amount, setAmount] = useState(entry.initialAmount);
  const [fxRate, setFxRate] = useState(entry.initialFxRate);
  const [note, setNote] = useState(entry.note);
  const [valueDate, setValueDate] = useState(entry.valueDate);
  const [state, action, pending] = useActionState(updateEntry, null);

  const isForeign = entry.currency !== "KRW";
  const label = TYPE_LABEL[entry.entryType] ?? entry.entryType;

  function getAmountLabel() {
    if (entry.entryType === "DEPOSIT") return isForeign ? `입금 금액 (${entry.currency})` : "입금 금액 (원)";
    if (entry.entryType === "WITHDRAWAL") return isForeign ? `출금 금액 (${entry.currency})` : "출금 금액 (원)";
    if (entry.entryType === "INVEST_RETURN") return "수익금 (원, 손실은 음수 입력)";
    return isForeign ? `현재 잔액 (${entry.currency})` : "현재 잔액 (원)";
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="entryId" value={entry.id} />

      {/* 계좌 & 거래 유형 (수정 불가, 표시만) */}
      <div className="px-4 py-3.5 rounded-[10px] bg-surface-soft border border-hairline">
        <p className="field-label" style={{ marginBottom: 2 }}>계좌</p>
        <p className="text-[15px] font-semibold text-ink">{entry.accountName}</p>
      </div>

      <div className="px-4 py-3.5 rounded-[10px] bg-surface-soft border border-hairline">
        <p className="field-label" style={{ marginBottom: 2 }}>거래 유형</p>
        <p className="text-[15px] font-semibold text-ink">{label}</p>
      </div>

      {/* 금액 */}
      <div>
        <label className="field-label">{getAmountLabel()}</label>
        <input
          name="amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(formatComma(e.target.value))}
          placeholder="0"
          className="field-input text-right text-[18px] font-semibold"
        />
      </div>

      {/* 환율 (외화 계좌이고 INVEST_RETURN 아닐 때) */}
      {isForeign && entry.entryType !== "INVEST_RETURN" && (
        <div>
          <label className="field-label">환율 (1 {entry.currency} = ? 원)</label>
          <input
            name="fxRate"
            type="number"
            inputMode="decimal"
            step="any"
            value={fxRate}
            onChange={(e) => setFxRate(e.target.value)}
            placeholder="예: 1,350"
            className="field-input"
          />
        </div>
      )}

      {/* 거래 날짜 */}
      <div>
        <label className="field-label">거래 날짜</label>
        <input
          name="valueDate"
          type="date"
          value={valueDate}
          onChange={(e) => setValueDate(e.target.value)}
          className="field-input"
        />
      </div>

      {/* 메모 */}
      <div>
        <label className="field-label">메모 (선택)</label>
        <input
          name="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 월급, 배당금 등"
          className="field-input"
        />
      </div>

      {state && !state.success && <p className="error-box">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "저장 중..." : "수정 저장"}
      </button>
    </form>
  );
}
