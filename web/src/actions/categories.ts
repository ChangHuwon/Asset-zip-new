"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { ActionResult } from "./auth";

export async function createCategory(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const name = (formData.get("name") as string)?.trim();

  if (!name) return { success: false, error: "카테고리 이름을 입력해주세요." };

  const existing = await prisma.assetCategory.findFirst({
    where: { familyId: session.familyId, name },
  });
  if (existing) return { success: false, error: "같은 이름의 카테고리가 이미 있습니다." };

  const maxOrder = await prisma.assetCategory.aggregate({
    where: { familyId: session.familyId },
    _max: { sortOrder: true },
  });

  await prisma.assetCategory.create({
    data: {
      familyId: session.familyId,
      name,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  redirect("/categories");
}

export async function deleteCategory(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const categoryId = formData.get("categoryId") as string;

  const category = await prisma.assetCategory.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { accounts: true } } },
  });

  if (!category || category.familyId !== session.familyId)
    return { success: false, error: "카테고리를 찾을 수 없습니다." };

  if (category._count.accounts > 0)
    return { success: false, error: `'${category.name}'에 계좌가 있어 삭제할 수 없습니다.` };

  await prisma.assetCategory.delete({ where: { id: categoryId } });

  redirect("/categories");
}
