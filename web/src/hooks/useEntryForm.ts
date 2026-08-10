export type EntryType = "BALANCE" | "DEPOSIT" | "WITHDRAWAL" | "INVEST_RETURN";
export type ReturnMode = "amount" | "rate";

export interface ValidationErrors {
  amount?: string;
  fxRate?: string;
  returnRate?: string;
}

// ─── 숫자 포맷 유틸 ───────────────────────────────────────────────────
export function formatComma(value: string): string {
  const raw = value.replace(/,/g, "");
  if (!/^-?\d*\.?\d*$/.test(raw)) return value;
  const isNeg = raw.startsWith("-");
  const abs = raw.replace("-", "");
  const [integer, decimal] = abs.split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const result = decimal !== undefined ? `${formatted}.${decimal}` : formatted;
  return isNeg ? `-${result}` : result;
}

export function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/,/g, ""));
}

// ─── 금액 유효성 검증 훅 ─────────────────────────────────────────────
export function useEntryValidation(params: {
  entryType: EntryType;
  returnMode: ReturnMode;
  amount: string;
  fxRate: string;
  returnRate: string;
  selectedCurrency: string;
}): { errors: ValidationErrors; isFormValid: boolean } {
  const { entryType, returnMode, amount, fxRate, returnRate, selectedCurrency } = params;

  const errors: ValidationErrors = {};
  const isForeign = selectedCurrency !== "KRW";
  const isRateMode = entryType === "INVEST_RETURN" && returnMode === "rate";
  const needsFxRate = isForeign && entryType !== "INVEST_RETURN";

  // 금액 검증 (rate 모드 제외)
  if (!isRateMode && amount !== "") {
    const num = parseAmount(amount);
    if (isNaN(num)) {
      errors.amount = "올바른 숫자를 입력해주세요.";
    } else if (entryType === "BALANCE" && num < 0) {
      errors.amount = "잔액은 0 이상이어야 합니다.";
    } else if ((entryType === "DEPOSIT" || entryType === "WITHDRAWAL") && num <= 0) {
      errors.amount = "금액은 0보다 커야 합니다.";
    }
  }

  // 수익률 검증 (rate 모드)
  if (isRateMode && returnRate !== "") {
    const rate = parseFloat(returnRate);
    if (isNaN(rate)) {
      errors.returnRate = "올바른 수익률을 입력해주세요.";
    }
  }

  // 환율 검증 (외화)
  if (needsFxRate && fxRate !== "") {
    const rate = parseFloat(fxRate);
    if (isNaN(rate) || rate <= 0) {
      errors.fxRate = "올바른 환율을 입력해주세요.";
    }
  }

  // 필수 입력 여부 확인
  const hasErrors = Object.keys(errors).length > 0;
  let hasRequired: boolean;
  if (isRateMode) {
    hasRequired = returnRate.trim() !== "";
  } else {
    hasRequired = amount.trim() !== "";
    if (needsFxRate) hasRequired = hasRequired && fxRate.trim() !== "";
  }

  return { errors, isFormValid: !hasErrors && hasRequired };
}

// ─── 결과 미리보기 계산 훅 ───────────────────────────────────────────
export function useEntryPreview(params: {
  entryType: EntryType;
  returnMode: ReturnMode;
  amount: string;
  fxRate: string;
  returnRate: string;
  selectedCurrency: string;
  currentBalanceKrw: number;
}): string | null {
  const { entryType, returnMode, amount, fxRate, returnRate, selectedCurrency, currentBalanceKrw } = params;

  const rawAmount = amount.replace(/,/g, "");
  const numAmount = parseFloat(rawAmount);
  const isForeign = selectedCurrency !== "KRW";
  const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

  // INVEST_RETURN + 수익률 모드
  if (entryType === "INVEST_RETURN" && returnMode === "rate") {
    const rate = parseFloat(returnRate);
    if (isNaN(rate) || currentBalanceKrw <= 0) return null;
    const delta = Math.round(currentBalanceKrw * (rate / 100));
    const newBal = Math.max(0, currentBalanceKrw + delta);
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${fmt(delta)}원 → 잔액 ${fmt(newBal)}원`;
  }

  // 외화
  if (isForeign && rawAmount !== "" && fxRate !== "") {
    const fxNum = parseFloat(fxRate);
    if (isNaN(numAmount) || isNaN(fxNum) || fxNum <= 0) return null;
    const krwRounded = Math.round(numAmount * fxNum);
    if (entryType === "DEPOSIT") {
      return `+${fmt(krwRounded)}원 → 잔액 ${fmt(currentBalanceKrw + krwRounded)}원`;
    }
    if (entryType === "WITHDRAWAL") {
      return `-${fmt(krwRounded)}원 → 잔액 ${fmt(Math.max(0, currentBalanceKrw - krwRounded))}원`;
    }
    return `${fmt(krwRounded)}원`;
  }

  // 원화 DEPOSIT / WITHDRAWAL
  if ((entryType === "DEPOSIT" || entryType === "WITHDRAWAL") && !isNaN(numAmount) && numAmount > 0) {
    if (entryType === "DEPOSIT") {
      return `+${fmt(numAmount)}원 → 잔액 ${fmt(currentBalanceKrw + Math.round(numAmount))}원`;
    }
    return `-${fmt(numAmount)}원 → 잔액 ${fmt(Math.max(0, currentBalanceKrw - Math.round(numAmount)))}원`;
  }

  // INVEST_RETURN + 수익금 모드
  if (entryType === "INVEST_RETURN" && returnMode === "amount" && rawAmount !== "" && !isNaN(numAmount)) {
    const newBal = Math.max(0, currentBalanceKrw + Math.round(numAmount));
    const sign = numAmount >= 0 ? "+" : "";
    return `${sign}${fmt(numAmount)}원 → 잔액 ${fmt(newBal)}원`;
  }

  return null;
}
