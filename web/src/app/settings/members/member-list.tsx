"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { deleteMember, resetMemberPin } from "@/actions/auth";

type Member = { id: string; displayName: string; isOwner: boolean };
type ToastState = { msg: string; ok: boolean } | null;

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  return (
    <div
      className="fixed bottom-6 left-4 right-4 flex justify-center z-50 pointer-events-none"
      style={{
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.22s ease, opacity 0.22s ease",
      }}
    >
      <div
        className={`px-5 py-3.5 rounded-[14px] text-[14px] font-semibold text-white shadow-lg ${
          ok ? "bg-[#1e1e2e]" : "bg-[#fc642d]"
        }`}
      >
        {ok ? "✓ " : "✕ "}{msg}
      </div>
    </div>
  );
}

export function MemberList({
  members,
  currentMemberId,
}: {
  members: Member[];
  currentMemberId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastState>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  function handleDelete(memberId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("memberId", memberId);
      const result = await deleteMember(null, fd);
      if (result.success) {
        showToast("계정이 삭제 처리되었습니다.", true);
        router.refresh();
      } else {
        showToast((result as { success: false; error: string }).error, false);
      }
      setConfirmDeleteId(null);
    });
  }

  function handleResetPin(memberId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("memberId", memberId);
      const result = await resetMemberPin(null, fd);
      if (result.success) {
        showToast("PIN이 111111로 초기화되었습니다.", true);
      } else {
        showToast((result as { success: false; error: string }).error, false);
      }
    });
  }

  return (
    <>
      <p className="text-[13px] font-semibold text-muted uppercase tracking-wide px-1 mb-3">
        사용자 목록
      </p>
      <div className="flex flex-col gap-2">
        {members.map((m) => {
          const deleted = m.displayName.endsWith("(계정삭제)");
          const isSelf = m.id === currentMemberId;
          const canDelete = !isSelf && !m.isOwner && !deleted;
          const canReset = !deleted;

          return (
            <div
              key={m.id}
              className="bg-canvas rounded-2xl px-5 py-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`text-[15px] font-semibold truncate ${deleted ? "text-muted" : "text-ink"}`}>
                    {m.displayName}
                  </span>
                  {m.isOwner && (
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fff1f3] text-primary">
                      관리자
                    </span>
                  )}
                  {isSelf && (
                    <span className="shrink-0 text-[11px] font-semibold text-muted">본인</span>
                  )}
                </div>

                {!deleted && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {canReset && confirmDeleteId !== m.id && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleResetPin(m.id)}
                        className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold text-[#3b82f6] bg-[#eff6ff] disabled:opacity-40"
                      >
                        PIN 초기화
                      </button>
                    )}
                    {canDelete && confirmDeleteId !== m.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(m.id)}
                        className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold text-[#fc642d] bg-[#fff3ef]"
                      >
                        삭제
                      </button>
                    )}
                    {canDelete && confirmDeleteId === m.id && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-muted">정말 삭제?</span>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(m.id)}
                          className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold text-white bg-[#fc642d] disabled:opacity-40"
                        >
                          확인
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold text-muted bg-[#f2f2f2]"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </>
  );
}
