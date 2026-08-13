"use client";
import { useActionState, useState } from "react";
import { deleteEntry } from "@/actions/entries";
import Link from "next/link";

export function EntryActions({ entryId }: { entryId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [state, action, pending] = useActionState(deleteEntry, null);

  if (confirm) {
    return (
      <form action={action} className="flex items-center gap-3 mt-3 pt-3 border-t border-hairline">
        <input type="hidden" name="entryId" value={entryId} />
        <span className="text-[13px] text-muted flex-1">삭제할까요?</span>
        <button
          type="submit"
          disabled={pending}
          className="text-[13px] font-semibold text-[#fc642d]"
        >
          {pending ? "삭제 중..." : "삭제 확인"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="text-[13px] text-muted"
        >
          취소
        </button>
        {state && !state.success && (
          <span className="text-[12px] text-[#fc642d]">{state.error}</span>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-hairline">
      <Link
        href={`/entries/${entryId}/edit`}
        className="flex-1 text-center h-8 flex items-center justify-center rounded-[8px] text-[13px] font-semibold text-primary bg-[#fff1f3]"
      >
        수정
      </Link>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="flex-1 h-8 flex items-center justify-center rounded-[8px] text-[13px] font-semibold text-muted bg-surface-soft"
      >
        삭제
      </button>
    </div>
  );
}
