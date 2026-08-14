"use client";
import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { deleteEntry } from "@/actions/entries";
import { EditEntryForm, type EntryForEdit } from "@/app/entries/[id]/edit/form";

export function EntryActions({ entry }: { entry: EntryForEdit }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteEntry, null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() {
    setOpen(false);
    setConfirmDelete(false);
  }

  const modal = open && mounted && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="w-full max-w-2xl bg-canvas rounded-t-2xl overflow-y-auto max-h-[92vh]">
        {/* 모달 헤더 */}
        <div className="relative flex items-center justify-between px-5 h-14 border-b border-hairline sticky top-0 bg-canvas z-10">
          <div className="w-6" />
          <p className="text-[15px] font-semibold text-ink">내역 수정</p>
          <button
            type="button"
            onClick={close}
            className="text-[20px] text-muted leading-none w-6 text-right"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-5 flex flex-col gap-4">
          <EditEntryForm key={entry.id} entry={entry} />

          {/* 삭제 섹션 */}
          <div className="border-t border-hairline pt-4 pb-2">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full h-11 rounded-[10px] text-[14px] font-semibold text-[#fc642d] border border-[#fc642d]/20 bg-[#fff3ef]"
              >
                이 내역 삭제
              </button>
            ) : (
              <form action={deleteAction} className="flex items-center gap-3">
                <input type="hidden" name="entryId" value={entry.id} />
                <span className="text-[13px] text-muted flex-1">정말 삭제할까요?</span>
                <button
                  type="submit"
                  disabled={deletePending}
                  className="text-[13px] font-semibold text-[#fc642d]"
                >
                  {deletePending ? "삭제 중..." : "삭제 확인"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-[13px] text-muted"
                >
                  취소
                </button>
              </form>
            )}
            {deleteState && !deleteState.success && (
              <p className="text-[12px] text-[#fc642d] mt-2">{deleteState.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div className="mt-3 pt-3 border-t border-hairline">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full h-8 flex items-center justify-center rounded-[8px] text-[13px] font-semibold text-primary bg-[#fff1f3]"
        >
          수정
        </button>
      </div>
      {modal}
    </>
  );
}
