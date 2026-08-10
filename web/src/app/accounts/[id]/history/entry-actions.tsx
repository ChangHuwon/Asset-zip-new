"use client";
import { useActionState, useState } from "react";
import { deleteEntry } from "@/actions/entries";
import Link from "next/link";

export function EntryActions({ entryId }: { entryId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [state, action, pending] = useActionState(deleteEntry, null);

  if (confirm) {
    return (
      <form action={action} className="flex items-center gap-2 mt-2">
        <input type="hidden" name="entryId" value={entryId} />
        <span className="text-[12px] text-muted">삭제할까요?</span>
        <button
          type="submit"
          disabled={pending}
          className="text-[12px] font-semibold text-[#fc642d]"
        >
          {pending ? "삭제 중..." : "확인"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="text-[12px] text-muted"
        >
          취소
        </button>
        {state && !state.success && (
          <span className="text-[11px] text-[#fc642d]">{state.error}</span>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-2">
      <Link
        href={`/entries/${entryId}/edit`}
        className="text-[12px] font-semibold text-primary"
      >
        수정
      </Link>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-[12px] font-semibold text-muted"
      >
        삭제
      </button>
    </div>
  );
}
