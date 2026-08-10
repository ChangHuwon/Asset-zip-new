"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { ActionResult } from "./auth";

export async function createAccount(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const categoryId = formData.get("categoryId") as string;
  const name = (formData.get("name") as string)?.trim();
  const currency = (formData.get("currency") as string) || "KRW";
  const note = (formData.get("note") as string)?.trim() || null;

  if (!categoryId) return { success: false, error: "카테고리를 선택해주세요." };
  if (!name) return { success: false, error: "계좌 이름을 입력해주세요." };

  const cat = await prisma.assetCategory.findUnique({
    where: { id: categoryId },
    select: { familyId: true },
  });
  if (!cat || cat.familyId !== session.familyId)
    return { success: false, error: "잘못된 카테고리입니다." };

  const account = await prisma.account.create({
    data: { familyId: session.familyId, categoryId, name, currency, note: note ?? undefined },
  });

  redirect(`/entries/new?accountId=${account.id}`);
}

export async function getMyCategories() {
  const session = await verifySession();
  return prisma.assetCategory.findMany({
    where: { familyId: session.familyId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}
