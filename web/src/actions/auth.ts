"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { generateInviteCode } from "@/lib/invite-code";

const DEFAULT_CATEGORIES = [
  { name: "예금", sortOrder: 1 },
  { name: "국내주식", sortOrder: 2 },
  { name: "해외주식", sortOrder: 3 },
  { name: "펀드/ETF", sortOrder: 4 },
];

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createFamily(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const familyName = (formData.get("familyName") as string)?.trim();
  const displayName = (formData.get("displayName") as string)?.trim();
  const pin = formData.get("pin") as string;

  if (!familyName || familyName.length < 1)
    return { success: false, error: "가족 그룹 이름을 입력해주세요." };
  if (!displayName || displayName.length < 1)
    return { success: false, error: "표시 이름을 입력해주세요." };
  if (!/^\d{4}$/.test(pin))
    return { success: false, error: "PIN은 숫자 4자리여야 합니다." };

  const inviteCode = generateInviteCode();
  const pinHash = await bcrypt.hash(pin, 10);

  const family = await prisma.family.create({
    data: {
      name: familyName,
      inviteCode,
      assetCategories: {
        create: DEFAULT_CATEGORIES,
      },
      members: {
        create: { displayName, pinHash },
      },
    },
    include: { members: true },
  });

  const member = family.members[0];
  await createSession({
    memberId: member.id,
    familyId: family.id,
    displayName: member.displayName,
  });

  redirect("/dashboard");
}

export async function getFamilyByCode(
  inviteCode: string
): Promise<{ id: string; name: string } | null> {
  return prisma.family.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
    select: { id: true, name: true },
  });
}

export async function joinFamily(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const familyId = formData.get("familyId") as string;
  const displayName = (formData.get("displayName") as string)?.trim();
  const pin = formData.get("pin") as string;

  if (!displayName) return { success: false, error: "표시 이름을 입력해주세요." };
  if (!/^\d{4}$/.test(pin))
    return { success: false, error: "PIN은 숫자 4자리여야 합니다." };

  const existing = await prisma.member.findUnique({
    where: { familyId_displayName: { familyId, displayName } },
  });
  if (existing)
    return {
      success: false,
      error:
        "이미 사용 중인 이름입니다. 다른 이름(예: '아빠2', '엄마_큰딸')을 입력해주세요.",
    };

  const pinHash = await bcrypt.hash(pin, 10);
  const member = await prisma.member.create({
    data: { familyId, displayName, pinHash },
  });

  await createSession({
    memberId: member.id,
    familyId,
    displayName: member.displayName,
  });

  redirect("/dashboard");
}

export async function getMembersForFamily(inviteCode: string) {
  const family = await prisma.family.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
    select: {
      id: true,
      name: true,
      members: { select: { id: true, displayName: true } },
    },
  });
  return family;
}

export async function loginWithPin(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const memberId = formData.get("memberId") as string;
  const pin = formData.get("pin") as string;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { family: true },
  });
  if (!member) return { success: false, error: "인증 정보를 확인해주세요." };

  if (member.lockedUntil && member.lockedUntil > new Date()) {
    const seconds = Math.ceil(
      (member.lockedUntil.getTime() - Date.now()) / 1000
    );
    return {
      success: false,
      error: `로그인 시도가 너무 많습니다. ${seconds}초 후 다시 시도하세요.`,
    };
  }

  const valid = await bcrypt.compare(pin, member.pinHash);
  if (!valid) {
    const newFails = (member.failedAttempts || 0) + 1;
    const lockedUntil = newFails >= 5 ? new Date(Date.now() + 5 * 60 * 1000) : null;
    await prisma.member.update({
      where: { id: memberId },
      data: { failedAttempts: newFails, lockedUntil },
    });
    const remaining = Math.max(0, 5 - newFails);
    return {
      success: false,
      error:
        remaining > 0
          ? `PIN이 올바르지 않습니다. ${remaining}회 남았습니다.`
          : "5회 실패로 5분간 잠금됩니다.",
    };
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  await createSession({
    memberId: member.id,
    familyId: member.familyId,
    displayName: member.displayName,
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/start");
}
