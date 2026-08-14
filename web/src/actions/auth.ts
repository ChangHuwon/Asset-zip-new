"use server";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { verifySession } from "@/lib/dal";
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

function hashPin(pin: string): string {
  return createHash("sha256").update(`asset-zip-pin:${pin}`).digest("hex");
}

export async function createFamily(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const familyName = (formData.get("familyName") as string)?.trim();
  const displayName = (formData.get("displayName") as string)?.trim();
  const pin = formData.get("pin") as string;

  if (!familyName) return { success: false, error: "가족 그룹 이름을 입력해주세요." };
  if (!displayName) return { success: false, error: "표시 이름을 입력해주세요." };
  if (!/^\d{6}$/.test(pin)) return { success: false, error: "PIN은 숫자 6자리여야 합니다." };

  const pinHash = hashPin(pin);

  const duplicate = await prisma.member.findUnique({ where: { pinHash } });
  if (duplicate) return { success: false, error: "이미 사용 중인 PIN입니다. 다른 PIN을 입력해주세요." };

  const inviteCode = generateInviteCode();

  const family = await prisma.family.create({
    data: {
      name: familyName,
      inviteCode,
      assetCategories: { create: DEFAULT_CATEGORIES },
      members: { create: { displayName, pinHash, isOwner: true } },
    },
    include: { members: true },
  });

  const member = family.members[0];
  await createSession({
    memberId: member.id,
    familyId: family.id,
    displayName: member.displayName,
    isOwner: true,
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
  if (!/^\d{6}$/.test(pin)) return { success: false, error: "PIN은 숫자 6자리여야 합니다." };

  const pinHash = hashPin(pin);

  const duplicate = await prisma.member.findUnique({ where: { pinHash } });
  if (duplicate) return { success: false, error: "이미 사용 중인 PIN입니다. 다른 PIN을 입력해주세요." };

  const existing = await prisma.member.findUnique({
    where: { familyId_displayName: { familyId, displayName } },
  });
  if (existing) return { success: false, error: "이미 사용 중인 표시 이름입니다." };

  const member = await prisma.member.create({
    data: { familyId, displayName, pinHash, isOwner: false },
  });

  await createSession({
    memberId: member.id,
    familyId,
    displayName: member.displayName,
    isOwner: false,
  });

  redirect("/dashboard");
}

export async function loginWithPin(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const pin = formData.get("pin") as string;

  if (!/^\d{6}$/.test(pin))
    return { success: false, error: "PIN은 숫자 6자리여야 합니다." };

  const pinHash = hashPin(pin);

  const member = await prisma.member.findUnique({
    where: { pinHash },
    include: { family: true },
  });

  if (!member) {
    return { success: false, error: "PIN을 확인해주세요." };
  }

  if (member.lockedUntil && member.lockedUntil > new Date()) {
    const seconds = Math.ceil((member.lockedUntil.getTime() - Date.now()) / 1000);
    return { success: false, error: `로그인 시도가 너무 많습니다. ${seconds}초 후 다시 시도하세요.` };
  }

  // SHA-256 해시로 조회했으므로 PIN이 일치함 — 실패 카운트 초기화
  await prisma.member.update({
    where: { id: member.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  await createSession({
    memberId: member.id,
    familyId: member.familyId,
    displayName: member.displayName,
    isOwner: member.isOwner,
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function deleteMember(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.isOwner) return { success: false, error: "권한이 없습니다." };

  const memberId = formData.get("memberId") as string;
  if (memberId === session.memberId) return { success: false, error: "자신의 계정은 삭제할 수 없습니다." };

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member || member.familyId !== session.familyId) return { success: false, error: "잘못된 사용자입니다." };
  if (member.isOwner) return { success: false, error: "관리자 계정은 삭제할 수 없습니다." };
  if (member.displayName.endsWith("(계정삭제)")) return { success: false, error: "이미 삭제된 계정입니다." };

  const { randomBytes } = await import("crypto");
  const invalidPinHash = randomBytes(32).toString("hex");

  await prisma.member.update({
    where: { id: memberId },
    data: { displayName: `${member.displayName}(계정삭제)`, pinHash: invalidPinHash, failedAttempts: 0, lockedUntil: null },
  });

  return { success: true };
}

export async function resetMemberPin(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  if (!session.isOwner) return { success: false, error: "권한이 없습니다." };

  const memberId = formData.get("memberId") as string;
  const member = await prisma.member.findFirst({ where: { id: memberId, familyId: session.familyId } });
  if (!member) return { success: false, error: "잘못된 사용자입니다." };
  if (member.displayName.endsWith("(계정삭제)")) return { success: false, error: "삭제된 계정은 PIN을 초기화할 수 없습니다." };

  const tempHash = hashPin("111111");
  const duplicate = await prisma.member.findFirst({ where: { pinHash: tempHash, NOT: { id: memberId } } });
  if (duplicate) return { success: false, error: "임시 PIN(111111)이 이미 다른 사용자에 의해 사용 중입니다." };

  await prisma.member.update({
    where: { id: memberId },
    data: { pinHash: tempHash, failedAttempts: 0, lockedUntil: null },
  });

  return { success: true };
}

export async function changePin(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const currentPin = (formData.get("currentPin") as string) ?? "";
  const newPin = (formData.get("newPin") as string) ?? "";
  const confirmPin = (formData.get("confirmPin") as string) ?? "";

  if (!/^\d{6}$/.test(currentPin)) return { success: false, error: "현재 PIN은 숫자 6자리여야 합니다." };
  if (!/^\d{6}$/.test(newPin)) return { success: false, error: "새 PIN은 숫자 6자리여야 합니다." };
  if (newPin !== confirmPin) return { success: false, error: "새 PIN이 일치하지 않습니다." };
  if (currentPin === newPin) return { success: false, error: "현재 PIN과 동일한 PIN은 사용할 수 없습니다." };

  const session = await verifySession();
  const currentHash = hashPin(currentPin);

  const member = await prisma.member.findFirst({
    where: { id: session.memberId, pinHash: currentHash },
  });
  if (!member) return { success: false, error: "현재 PIN이 올바르지 않습니다." };

  const newHash = hashPin(newPin);
  const duplicate = await prisma.member.findFirst({
    where: { pinHash: newHash, NOT: { id: session.memberId } },
  });
  if (duplicate) return { success: false, error: "이미 사용 중인 PIN입니다. 다른 번호를 선택해주세요." };

  await prisma.member.update({
    where: { id: session.memberId },
    data: { pinHash: newHash },
  });

  return { success: true };
}
