"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { ActionResult } from "./auth";

/**
 * 특정 날짜 이하의 가장 최근 잔액을 가져온다.
 * valueDate가 있으면 valueDate 기준, 없으면 recordedAt 기준으로 필터링한다.
 * 정렬: valueDate DESC NULLS LAST → recordedAt DESC
 */
async function getLatestBalance(accountId: string, beforeDate: Date): Promise<bigint> {
  const latest = await prisma.entry.findFirst({
    where: {
      accountId,
      OR: [
        { valueDate: { lte: beforeDate } },
        { valueDate: null, recordedAt: { lte: beforeDate } },
      ],
    },
    orderBy: [
      { valueDate: { sort: "desc", nulls: "last" } },
      { recordedAt: "desc" },
    ],
    select: { amountKrw: true },
  });
  return latest?.amountKrw ?? BigInt(0);
}

export async function createEntry(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const accountId = formData.get("accountId") as string;
  const entryType = (formData.get("entryType") as string) || "BALANCE";
  const currency = formData.get("currency") as string;
  const rawAmount = (formData.get("amount") as string) ?? "";
  const fxRateStr = (formData.get("fxRate") as string) ?? "";
  const note = (formData.get("note") as string)?.trim() || null;
  const valueDateStr = (formData.get("valueDate") as string) ?? "";
  const valueDate = valueDateStr ? new Date(valueDateStr) : null;

  if (!accountId) return { success: false, error: "계좌를 선택해주세요." };

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { familyId: true },
  });
  if (!account || account.familyId !== session.familyId)
    return { success: false, error: "잘못된 계좌입니다." };

  // 이전 잔액 조회 기준일: 사용자 지정 날짜 또는 현재 시각
  const effectiveDate = valueDate ?? new Date();

  let amountKrw: bigint;
  let deltaKrw: bigint | null = null;
  let originalAmount: number | null = null;
  let originalCurrency: string | null = null;
  let fxRateUsed: number | null = null;

  if (entryType === "BALANCE") {
    const amount = parseFloat(rawAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount < 0)
      return { success: false, error: "올바른 금액을 입력해주세요." };

    if (currency !== "KRW" && currency) {
      const fxRate = parseFloat(fxRateStr);
      if (isNaN(fxRate) || fxRate <= 0)
        return { success: false, error: "환율을 입력해주세요." };
      originalAmount = amount;
      originalCurrency = currency;
      fxRateUsed = fxRate;
      amountKrw = BigInt(Math.round(amount * fxRate));
    } else {
      amountKrw = BigInt(Math.round(amount));
    }
  } else if (entryType === "DEPOSIT" || entryType === "WITHDRAWAL") {
    const amount = parseFloat(rawAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0)
      return { success: false, error: "올바른 금액을 입력해주세요." };

    let krwAmount: bigint;
    if (currency !== "KRW" && currency) {
      const fxRate = parseFloat(fxRateStr);
      if (isNaN(fxRate) || fxRate <= 0)
        return { success: false, error: "환율을 입력해주세요." };
      originalAmount = amount;
      originalCurrency = currency;
      fxRateUsed = fxRate;
      krwAmount = BigInt(Math.round(amount * fxRate));
    } else {
      krwAmount = BigInt(Math.round(amount));
    }

    const prevBalance = await getLatestBalance(accountId, effectiveDate);
    if (entryType === "DEPOSIT") {
      deltaKrw = krwAmount;
      amountKrw = prevBalance + krwAmount;
    } else {
      if (krwAmount > prevBalance)
        return { success: false, error: "출금액이 현재 잔액보다 클 수 없습니다." };
      deltaKrw = -krwAmount;
      amountKrw = prevBalance - krwAmount;
    }
  } else if (entryType === "INVEST_RETURN") {
    const returnMode = formData.get("returnMode") as string;
    const prevBalance = await getLatestBalance(accountId, effectiveDate);

    if (returnMode === "rate") {
      const rateStr = (formData.get("returnRate") as string) ?? "";
      const rate = parseFloat(rateStr);
      if (isNaN(rate)) return { success: false, error: "수익률을 입력해주세요." };
      const delta = BigInt(Math.round(Number(prevBalance) * (rate / 100)));
      deltaKrw = delta;
      amountKrw = prevBalance + delta;
      if (amountKrw < BigInt(0)) amountKrw = BigInt(0);
    } else {
      const amount = parseFloat(rawAmount.replace(/,/g, ""));
      if (isNaN(amount)) return { success: false, error: "수익금을 입력해주세요." };
      const isLoss = amount < 0;
      const krwAbs = BigInt(Math.round(Math.abs(amount)));
      deltaKrw = isLoss ? -krwAbs : krwAbs;
      amountKrw = prevBalance + deltaKrw;
      if (amountKrw < BigInt(0)) amountKrw = BigInt(0);
    }
  } else {
    return { success: false, error: "잘못된 거래 유형입니다." };
  }

  await prisma.entry.create({
    data: {
      accountId,
      memberId: session.memberId,
      entryType: entryType as "BALANCE" | "DEPOSIT" | "WITHDRAWAL" | "INVEST_RETURN",
      amountKrw,
      deltaKrw: deltaKrw !== null ? deltaKrw : undefined,
      originalAmount: originalAmount !== null ? originalAmount : undefined,
      originalCurrency: originalCurrency ?? undefined,
      fxRateUsed: fxRateUsed !== null ? fxRateUsed : undefined,
      note: note ?? undefined,
      valueDate: valueDate ?? undefined,
    },
  });

  redirect(`/accounts/${accountId}/history`);
}

export async function deleteEntry(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const entryId = formData.get("entryId") as string;

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { account: { select: { familyId: true } } },
  });

  if (!entry || entry.account.familyId !== session.familyId)
    return { success: false, error: "잘못된 내역입니다." };

  const accountId = entry.accountId;
  await prisma.entry.delete({ where: { id: entryId } });
  redirect(`/accounts/${accountId}/history`);
}

export async function updateEntry(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const entryId = formData.get("entryId") as string;

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { account: { select: { familyId: true } } },
  });

  if (!entry || entry.account.familyId !== session.familyId)
    return { success: false, error: "잘못된 내역입니다." };

  const rawAmount = (formData.get("amount") as string) ?? "";
  const fxRateStr = (formData.get("fxRate") as string) ?? "";
  const note = (formData.get("note") as string)?.trim() || null;
  const valueDateStr = (formData.get("valueDate") as string) ?? "";
  const valueDate = valueDateStr ? new Date(valueDateStr) : null;
  const entryAccountId = entry.accountId;

  // 거래 유형: 폼에서 변경 가능
  const VALID_TYPES = ["BALANCE", "DEPOSIT", "WITHDRAWAL", "INVEST_RETURN"] as const;
  type ValidType = typeof VALID_TYPES[number];
  const formEntryType = formData.get("entryType") as string;
  const entryType: ValidType = (VALID_TYPES as readonly string[]).includes(formEntryType)
    ? (formEntryType as ValidType)
    : entry.entryType;

  // 통화: INVEST_RETURN은 항상 원화, 그 외는 폼에서 읽음
  let currency: string;
  if (entryType === "INVEST_RETURN") {
    currency = "KRW";
  } else {
    const formCurrency = formData.get("currency") as string;
    currency = formCurrency || entry.originalCurrency || "KRW";
  }
  const newOriginalCurrency = currency !== "KRW" ? currency : null;

  // 수정 후의 기준일 (새 valueDate 또는 원래 recordedAt)
  const effectiveDate = valueDate ?? entry.recordedAt;

  let amountKrw: bigint;
  let deltaKrw: bigint | null = null;
  let originalAmount: number | null = null;
  let fxRateUsed: number | null = null;

  async function getPrevBalance(): Promise<bigint> {
    const prev = await prisma.entry.findFirst({
      where: {
        accountId: entryAccountId,
        id: { not: entryId },
        OR: [
          { valueDate: { lte: effectiveDate } },
          { valueDate: null, recordedAt: { lte: effectiveDate } },
        ],
      },
      orderBy: [
        { valueDate: { sort: "desc", nulls: "last" } },
        { recordedAt: "desc" },
      ],
      select: { amountKrw: true },
    });
    return prev?.amountKrw ?? BigInt(0);
  }

  if (entryType === "BALANCE") {
    const amount = parseFloat(rawAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount < 0)
      return { success: false, error: "올바른 금액을 입력해주세요." };

    if (currency !== "KRW") {
      const fxRate = parseFloat(fxRateStr);
      if (isNaN(fxRate) || fxRate <= 0)
        return { success: false, error: "환율을 입력해주세요." };
      originalAmount = amount;
      fxRateUsed = fxRate;
      amountKrw = BigInt(Math.round(amount * fxRate));
    } else {
      amountKrw = BigInt(Math.round(amount));
    }
  } else if (entryType === "DEPOSIT" || entryType === "WITHDRAWAL") {
    const amount = parseFloat(rawAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0)
      return { success: false, error: "올바른 금액을 입력해주세요." };

    let krwAmount: bigint;
    if (currency !== "KRW") {
      const fxRate = parseFloat(fxRateStr);
      if (isNaN(fxRate) || fxRate <= 0)
        return { success: false, error: "환율을 입력해주세요." };
      originalAmount = amount;
      fxRateUsed = fxRate;
      krwAmount = BigInt(Math.round(amount * fxRate));
    } else {
      krwAmount = BigInt(Math.round(amount));
    }

    const prevBalance = await getPrevBalance();
    if (entryType === "DEPOSIT") {
      deltaKrw = krwAmount;
      amountKrw = prevBalance + krwAmount;
    } else {
      if (krwAmount > prevBalance)
        return { success: false, error: "출금액이 현재 잔액보다 클 수 없습니다." };
      deltaKrw = -krwAmount;
      amountKrw = prevBalance - krwAmount;
    }
  } else if (entryType === "INVEST_RETURN") {
    const returnMode = (formData.get("returnMode") as string) || "amount";
    const prevBalance = await getPrevBalance();

    if (returnMode === "rate") {
      const rateStr = (formData.get("returnRate") as string) ?? "";
      const rate = parseFloat(rateStr);
      if (isNaN(rate)) return { success: false, error: "수익률을 입력해주세요." };
      const delta = BigInt(Math.round(Number(prevBalance) * (rate / 100)));
      deltaKrw = delta;
      amountKrw = prevBalance + delta;
      if (amountKrw < BigInt(0)) amountKrw = BigInt(0);
    } else {
      const amount = parseFloat(rawAmount.replace(/,/g, ""));
      if (isNaN(amount)) return { success: false, error: "수익금을 입력해주세요." };
      const isLoss = amount < 0;
      const krwAbs = BigInt(Math.round(Math.abs(amount)));
      deltaKrw = isLoss ? -krwAbs : krwAbs;
      amountKrw = prevBalance + deltaKrw;
      if (amountKrw < BigInt(0)) amountKrw = BigInt(0);
    }
  } else {
    return { success: false, error: "잘못된 거래 유형입니다." };
  }

  await prisma.entry.update({
    where: { id: entryId },
    data: {
      entryType,
      amountKrw,
      deltaKrw: deltaKrw !== null ? deltaKrw : null,
      originalAmount: originalAmount !== null ? originalAmount : null,
      originalCurrency: newOriginalCurrency,
      fxRateUsed: fxRateUsed !== null ? fxRateUsed : null,
      note,
      valueDate,
    },
  });

  redirect(`/accounts/${entryAccountId}/history`);
}
