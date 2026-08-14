"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { updateAccount, deleteAccount } from "@/actions/accounts";

const FOREIGN_CURRENCIES = [
  { code: "USD", label: "미국 달러 (USD)" },
  { code: "JPY", label: "일본 엔 (JPY)" },
  { code: "EUR", label: "유로 (EUR)" },
  { code: "CNY", label: "중국 위안 (CNY)" },
];

type Account = { id: string; name: string; currency: string; note: string | null; categoryId: string; entryCount: number };
type Category = { id: string; name: string };
type Group = { id: string; name: string; accounts: Account[] };
type ToastState = { msg: string; ok: boolean } | null;

/* ── Toast ───────────────────────────────────────────── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }, []);
  return (
    <div
      className="fixed bottom-6 left-4 right-4 flex justify-center z-[60] pointer-events-none"
      style={{ transform: visible ? "translateY(0)" : "translateY(20px)", opacity: visible ? 1 : 0, transition: "transform 0.22s ease, opacity 0.22s ease" }}
    >
      <div className={`px-5 py-3.5 rounded-[14px] text-[14px] font-semibold text-white shadow-lg ${ok ? "bg-[#1e1e2e]" : "bg-[#fc642d]"}`}>
        {ok ? "✓ " : "✕ "}{msg}
      </div>
    </div>
  );
}

/* ── 수정 모달 (슬라이드업) ──────────────────────────── */
function EditModal({
  account, categories, onClose, onSaved,
}: {
  account: Account; categories: Category[];
  onClose: () => void; onSaved: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(account.name);
  const [categoryId, setCategoryId] = useState(account.categoryId);
  const [currency, setCurrency] = useState(account.currency);
  const [note, setNote] = useState(account.note ?? "");
  const [error, setError] = useState("");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }, []);

  function close() {
    setVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(onClose, 320);
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("accountId", account.id);
      fd.set("name", name);
      fd.set("categoryId", categoryId);
      fd.set("currency", currency);
      fd.set("note", note);
      const result = await updateAccount(null, fd);
      if (result.success) { close(); onSaved(); }
      else setError((result as { success: false; error: string }).error);
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)", transition: "background-color 0.32s ease" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="w-full max-w-2xl bg-canvas rounded-t-2xl overflow-y-auto max-h-[92vh]"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-hairline sticky top-0 bg-canvas z-10">
          <div className="w-6" />
          <p className="text-[15px] font-semibold text-ink">계좌 수정</p>
          <button type="button" onClick={close} className="text-[20px] text-muted leading-none w-6 text-right">✕</button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          <div>
            <label className="field-label">계좌 이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">카테고리</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field-input">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">통화</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="field-input">
              <option value="KRW">원화 (KRW)</option>
              {FOREIGN_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">비고 (선택)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="field-input" style={{ height: "auto", paddingTop: "0.75rem", paddingBottom: "0.75rem", resize: "vertical" }} />
          </div>
          {error && <p className="error-box">{error}</p>}
          <button type="button" disabled={isPending || !name.trim()} onClick={handleSave} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── 삭제 확인 팝업 (중앙 다이얼로그) ───────────────── */
function DeleteDialog({
  account, onClose, onDeleted,
}: {
  account: Account; onClose: () => void; onDeleted: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true))); }, []);

  function handleDelete() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("accountId", account.id);
      const result = await deleteAccount(null, fd);
      if (result.success) onDeleted();
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)", transition: "background-color 0.2s ease" }}
    >
      <div
        className="w-full max-w-sm bg-canvas rounded-2xl p-6"
        style={{
          transform: visible ? "scale(1)" : "scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.2s ease, opacity 0.2s ease",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* 경고 아이콘 */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#fff3ef] mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fc642d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <p className="text-[17px] font-bold text-ink text-center mb-2">계좌를 삭제할까요?</p>
        <p className="text-[14px] text-muted text-center leading-relaxed mb-6">
          <span className="font-semibold text-ink">{account.name}</span>의<br />
          모든 내역&nbsp;
          <span className="font-semibold text-[#fc642d]">{account.entryCount}건</span>이 함께 삭제됩니다.<br />
          이 작업은 되돌릴 수 없습니다.
        </p>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-[10px] border border-hairline text-[14px] font-semibold text-muted bg-canvas">
            취소
          </button>
          <button type="button" disabled={isPending} onClick={handleDelete}
            className="flex-1 h-11 rounded-[10px] text-[14px] font-semibold text-white bg-[#fc642d] disabled:opacity-50">
            {isPending ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────── */
export function AccountList({ groups, categories }: { groups: Group[]; categories: Category[] }) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const totalAccounts = groups.reduce((n, g) => n + g.accounts.length, 0);

  return (
    <>
      {totalAccounts === 0 && (
        <p className="text-[14px] text-muted text-center py-12">등록된 계좌가 없습니다.</p>
      )}

      <div className="flex flex-col gap-5">
        {groups.filter((g) => g.accounts.length > 0).map((group) => (
          <div key={group.id}>
            <p className="text-[12px] font-semibold text-muted uppercase tracking-wide px-1 mb-2">{group.name}</p>
            <div className="flex flex-col gap-2">
              {group.accounts.map((acc) => (
                <div key={acc.id} className="bg-canvas rounded-2xl px-5 py-4 flex items-center justify-between gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-ink truncate">{acc.name}</p>
                    <p className="text-[12px] text-muted mt-0.5">{acc.currency} · 내역 {acc.entryCount}건</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingAccount(acc)}
                      className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold text-[#3b82f6] bg-[#eff6ff]"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAccount(acc)}
                      className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold text-[#fc642d] bg-[#fff3ef]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingAccount && (
        <EditModal
          key={editingAccount.id}
          account={editingAccount}
          categories={categories}
          onClose={() => setEditingAccount(null)}
          onSaved={() => { setEditingAccount(null); showToast("계좌 정보가 수정되었습니다.", true); router.refresh(); }}
        />
      )}

      {deletingAccount && (
        <DeleteDialog
          key={deletingAccount.id}
          account={deletingAccount}
          onClose={() => setDeletingAccount(null)}
          onDeleted={() => { setDeletingAccount(null); showToast("계좌가 삭제되었습니다.", true); router.refresh(); }}
        />
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </>
  );
}
