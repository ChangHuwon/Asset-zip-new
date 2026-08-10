-- Member.isOwner 추가
ALTER TABLE "Member" ADD COLUMN "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- Member.pinHash 전역 유니크 (6자리 PIN 기반 결정론적 해시)
-- 기존 멤버 데이터가 있다면 pinHash 중복 가능성 없으므로 바로 적용
CREATE UNIQUE INDEX "Member_pinHash_key" ON "Member"("pinHash");
