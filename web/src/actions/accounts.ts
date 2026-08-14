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

export async function updateAccount(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.isOwner) return { success: false, error: "권한이 없습니다." };

  const accountId = formData.get("accountId") as string;
  const categoryId = formData.get("categoryId") as string;
  const name = (formData.get("name") as string)?.trim();
  const currency = (formData.get("currency") as string) || "KRW";
  const note = (formData.get("note") as string)?.trim() || null;

  if (!name) return { success: false, error: "계좌 이름을 입력해주세요." };
  if (!categoryId) return { success: false, error: "카테고리를 선택해주세요." };

  const account = await prisma.account.findUnique({ where: { id: accountId }, select: { familyId: true } });
  if (!account || account.familyId !== session.familyId) return { success: false, error: "잘못된 계좌입니다." };

  const cat = await prisma.assetCategory.findUnique({ where: { id: categoryId }, select: { familyId: true } });
  if (!cat || cat.familyId !== session.familyId) return { success: false, error: "잘못된 카테고리입니다." };

  await prisma.account.update({ where: { id: accountId }, data: { name, categoryId, currency, note } });
  return { success: true };
}

export async function deleteAccount(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.isOwner) return { success: false, error: "권한이 없습니다." };

  const accountId = formData.get("accountId") as string;
  const account = await prisma.account.findUnique({ where: { id: accountId }, select: { familyId: true } });
  if (!account || account.familyId !== session.familyId) return { success: false, error: "잘못된 계좌입니다." };

  await prisma.$transaction([
    prisma.entry.deleteMany({ where: { accountId } }),
    prisma.account.delete({ where: { id: accountId } }),
  ]);

  return { success: true };
}

export async function getMyCategories() {
  const session = await verifySession();
  return prisma.assetCategory.findMany({
    where: { familyId: session.familyId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}
