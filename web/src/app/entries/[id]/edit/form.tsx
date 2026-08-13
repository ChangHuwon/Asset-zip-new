"use client";
import { useActionState, useState } from "react";
import { updateEntry } from "@/actions/entries";
import {
  formatComma,
  useEntryValidation,
  useEntryPreview,
  type EntryType,
  type ReturnMode,
} from "@/hooks/useEntryForm";

const FOREIGN_CURRENCIES = ["USD", "JPY", "EUR", "CNY"];

const ENTRY_TABS: { value: EntryType; label: string }[] = [
  { value: "BALANCE", label: "잔액 입력" },
  { value: "DEPOSIT", label: "입금" },
  { value: "WITHDRAWAL", label: "출금" },
  { value: "INVEST_RETURN", label: "투자 수익" },
];

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
  prevBalanceKrw: number;
};

export function EditEntryForm({ entry }: { entry: EntryForEdit }) {
  const [entryType, setEntryType] = useState<EntryType>(entry.entryType as EntryType);
  const [selectedCurrency, setSelectedCurrency] = useState(entry.currency);
  const [amount, setAmount] = useState(entry.initialAmount);
  const [fxRate, setFxRate] = useState(entry.initialFxRate);
  const [returnMode, setReturnMode] = useState<ReturnMode>("amount");
  const [returnRate, setReturnRate] = useState("");
  const [note, setNote] = useState(entry.note);
  const [valueDate, setValueDate] = useState(entry.valueDate);
  const [state, action, pending] = useActionState(updateEntry, null);

  const { errors, isFormValid } = useEntryValidation({
    entryType,
    returnMode,
    amount,
    fxRate,
    returnRate,
    selectedCurrency,
  });

  const preview = useEntryPreview({
    entryType,
    returnMode,
    amount,
    fxRate,
    returnRate,
    selectedCurrency,
    currentBalanceKrw: entry.prevBalanceKrw,
  });

  function switchTab(tab: EntryType) {
    setEntryType(tab);
    setAmount("");
    setFxRate("");
    setReturnRate("");
  }

  const isForeignCurrency = selectedCurrency !== "KRW";
  const showFxRate = isForeignCurrency && entryType !== "INVEST_RETURN";
  const isRateMode = entryType === "INVEST_RETURN" && returnMode === "rate";

  function getAmountLabel() {
    if (entryType === "DEPOSIT") return isForeignCurrency ? `입금 금액 (${selectedCurrency})` : "입금 금액 (원)";
    if (entryType === "WITHDRAWAL") return isForeignCurrency ? `출금 금액 (${selectedCurrency})` : "출금 금액 (원)";
    if (entryType === "INVEST_RETURN") return "수익금 (원, 손실은 음수 입력)";
    return isForeignCurrency ? `현재 잔액 (${selectedCurrency})` : "현재 잔액 (원)";
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="entryId" value={entry.id} />
      <input type="hidden" name="entryType" value={entryType} />

      {/* 계좌 */}
      <div className="px-4 py-3.5 rounded-[10px] bg-surface-soft border border-hairline">
        <p className="field-label" style={{ marginBottom: 2 }}>계좌</p>
        <p className="text-[15px] font-semibold text-ink">{entry.accountName}</p>
      </div>

      {/* 거래 유형 탭 */}
      <div>
        <p className="field-label">거래 유형</p>
        <div className="grid grid-cols-4 gap-1 p-1 bg-surface-soft rounded-[10px] border border-hairline">
          {ENTRY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => switchTab(tab.value)}
              className={`h-9 rounded-[8px] text-[12px] font-semibold transition-all ${
                entryType === tab.value
                  ? "bg-canvas text-ink shadow-sm"
                  : "text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BALANCE 덮어쓰기 경고 */}
      {entryType === "BALANCE" && entry.prevBalanceKrw > 0 && (
        <p className="warn-box">
          이전 잔액 <strong>{entry.prevBalanceKrw.toLocaleString("ko-KR")}원</strong>을 입력하는 값으로 덮어씁니다.
        </p>
      )}

      {/* INVEST_RETURN 수익 방식 */}
      {entryType === "INVEST_RETURN" && (
        <div>
          <p className="field-label">수익 방식</p>
          <input type="hidden" name="returnMode" value={returnMode} />
          <div className="flex gap-2">
            {(["amount", "rate"] as ReturnMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setReturnMode(m);
                  setAmount("");
                  setReturnRate("");
                }}
                className={`flex-1 h-11 rounded-[10px] text-[14px] font-semibold border transition-all ${
                  returnMode === m
                    ? "bg-ink text-on-primary border-ink"
                    : "bg-canvas text-muted border-hairline"
                }`}
              >
                {m === "amount" ? "수익금 입력" : "수익률 입력"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 통화 (INVEST_RETURN 제외) */}
      {entryType !== "INVEST_RETURN" && (
        <div>
          <label className="field-label">통화</label>
          <select
            name="currency"
            value={selectedCurrency}
            onChange={(e) => {
              setSelectedCurrency(e.target.value);
              setFxRate("");
            }}
            className="field-input"
          >
            <option value="KRW">원화 (KRW)</option>
            {FOREIGN_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* 수익률 입력 (rate 모드) */}
      {isRateMode && (
        <div>
          <label className="field-label">수익률 (%)</label>
          <input
            name="returnRate"
            type="number"
            inputMode="decimal"
            step="any"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
            placeholder="예: 5.2 (손실은 음수 입력)"
            className={`field-input ${errors.returnRate ? "border-[#fc642d]" : ""}`}
          />
          {errors.returnRate && (
            <p className="text-[12px] text-[#fc642d] mt-1">{errors.returnRate}</p>
          )}
        </div>
      )}

      {/* 금액 입력 (rate 모드 제외) */}
      {!isRateMode && (
        <div>
          <label className="field-label">{getAmountLabel()}</label>
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(formatComma(e.target.value))}
            placeholder="0"
            className={`field-input text-right text-[18px] font-semibold ${errors.amount ? "border-[#fc642d]" : ""}`}
          />
          {errors.amount && (
            <p className="text-[12px] text-[#fc642d] mt-1">{errors.amount}</p>
          )}
        </div>
      )}

      {/* 환율 */}
      {showFxRate && (
        <div>
          <label className="field-label">환율 (1 {selectedCurrency} = ? 원)</label>
          <input
            name="fxRate"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={fxRate}
            onChange={(e) => setFxRate(e.target.value)}
            placeholder="예: 1,350"
            className={`field-input ${errors.fxRate ? "border-[#fc642d]" : ""}`}
          />
          {errors.fxRate && (
            <p className="text-[12px] text-[#fc642d] mt-1">{errors.fxRate}</p>
          )}
        </div>
      )}

      {/* 결과 미리보기 */}
      {preview && (
        <div className="px-4 py-2.5 rounded-[8px] bg-surface-soft flex items-center justify-between">
          <span className="text-[13px] text-muted">결과 미리보기</span>
          <span className="text-[14px] font-bold text-ink">{preview}</span>
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

      <button
        type="submit"
        disabled={pending || !isFormValid}
        className="btn-primary mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "저장 중..." : "수정 저장"}
      </button>
    </form>
  );
}
