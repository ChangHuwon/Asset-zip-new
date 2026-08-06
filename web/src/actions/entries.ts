"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { ActionResult } from "./auth";

export async function createEntry(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const accountId = formData.get("accountId") as string;
  const currency = formData.get("currency") as string;
  const rawAmount = formData.get("amount") as string;
  const fxRateStr = formData.get("fxRate") as string;

  if (!accountId) return { success: false, error: "계좌를 선택해주세요." };

  const amount = parseFloat(rawAmount.replace(/,/g, ""));
  if (isNaN(amount) || amount < 0)
    return { success: false, error: "올바른 금액을 입력해주세요." };

  let amountKrw: bigint;
  let originalAmount: number | null = null;
  let originalCurrency: string | null = null;
  let fxRateUsed: number | null = null;

  if (currency === "KRW" || !currency) {
    amountKrw = BigInt(Math.round(amount));
  } else {
    const fxRate = parseFloat(fxRateStr);
    if (isNaN(fxRate) || fxRate <= 0)
      return { success: false, error: "환율을 입력해주세요." };
    originalAmount = amount;
    originalCurrency = currency;
    fxRateUsed = fxRate;
    amountKrw = BigInt(Math.round(amount * fxRate));
  }

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { familyId: true },
  });
  if (!account || account.familyId !== session.familyId)
    return { success: false, error: "잘못된 계좌입니다." };

  await prisma.entry.create({
    data: {
      accountId,
      memberId: session.memberId,
      amountKrw,
      originalAmount: originalAmount !== null ? originalAmount : undefined,
      originalCurrency: originalCurrency ?? undefined,
      fxRateUsed: fxRateUsed !== null ? fxRateUsed : undefined,
    },
  });

  redirect("/dashboard");
}
