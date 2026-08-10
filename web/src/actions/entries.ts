"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { ActionResult } from "./auth";

async function getLatestBalance(accountId: string): Promise<bigint> {
  const latest = await prisma.entry.findFirst({
    where: { accountId },
    orderBy: { recordedAt: "desc" },
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

    const prevBalance = await getLatestBalance(accountId);
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
    const prevBalance = await getLatestBalance(accountId);

    if (returnMode === "rate") {
      const rateStr = (formData.get("returnRate") as string) ?? "";
      const rate = parseFloat(rateStr);
      if (isNaN(rate)) return { success: false, error: "수익률을 입력해주세요." };
      const delta = BigInt(Math.round(Number(prevBalance) * (rate / 100)));
      deltaKrw = delta;
      amountKrw = prevBalance + delta;
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
